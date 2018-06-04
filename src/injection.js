import isobject from 'isobject'
import PropTypes from 'prop-types'
import { Component, createElement } from 'react'

/**
 * Public API
 */

export const inject = createInjector('inject', createAlfaProvidedComponent)
export const subscribe = createInjector(
  'subscribe',
  createAlfaSubscribedComponent
)

/**
 * Private functions
 */

function createInjector(type, creator) {
  return function(WrappedComponent, inputs, outputs) {
    /* istanbul ignore next */
    if (typeof WrappedComponent === 'function') {
      const componentName = WrappedComponent.name
      inputs = normalizeInputs(componentName, inputs, WrappedComponent.keys)
      outputs = normalizeOutputs(componentName, inputs, outputs)
      return creator(WrappedComponent, inputs, outputs)
    } else {
      throw new TypeError(
        `alfa.${type} only accepts function or class. Got "${typeof WrappedComponent}".`
      )
    }
  }
}

export function normalizeInputs(name, inputs, dynamicInputs) {
  if (
    inputs &&
    ('string' === typeof inputs ||
      (isobject(inputs) &&
        /* istanbul ignore next */
        typeof inputs.alfaAction === 'function'))
  ) {
    return [inputs]
  } else if (Array.isArray(inputs)) {
    return inputs
  } else if ('function' === typeof dynamicInputs) {
    return []
  } else {
    throw new TypeError(
      `${name}: inject/subscribe only accepts string or array of strings as second parameter (inputs) when static property 'keys' of component does not exist.`
    )
  }
}

export function normalizeOutputs(name, inputs, outputs) {
  // Check if output keys are provided when `set` is required as input key.
  if (
    Array.isArray(inputs) &&
    inputs.indexOf('set') > -1 &&
    (!Array.isArray(outputs) || 0 === outputs.length)
  ) {
    throw new Error(
      `${name}: outputs are required as 3rd argument of function "inject/subscribe" when "set" is provided/subscribed.`
    )
  }

  if (outputs) {
    // When we have key(s) of output we need to check the type(s) of all the keys.
    if ('string' === typeof outputs) {
      // The outputs is a string then normalize it as an array.
      return [outputs]
    }

    if (
      Array.isArray(outputs) &&
      outputs.every(key => typeof key === 'string')
    ) {
      // Outputs is an array, make sure all the elements of this array are string.
      return outputs
    }

    // Throw exception if any key of the outputs is not supported.
    throw new TypeError(
      `${name}: inject/subscribe only accepts string or array of strings as 3rd parameter (outputs).`
    )
  }
}

function createAlfaProvidedComponent(WrappedComponent, inputs, outputs) {
  const keys = WrappedComponent.keys

  function AlfaProvidedComponent(props, context, updater) {
    const alfaStore = context && context.alfaStore
    const injectedProps = getInjectedProps(inputs, outputs, alfaStore)
    // Props passed in directly to constructor has lower priority than inputs
    // injected from the store.
    var _props = { ...props, ...injectedProps }
    const dynamicProps = getDynamicProps(keys, _props, outputs, alfaStore)
    // Dynamic props has higher priority than static props.
    if (dynamicProps) {
      _props = { ..._props, ...dynamicProps.props }
    }

    if (WrappedComponent.prototype.isReactComponent) {
      // Create an element if it's react component.
      return createElement(WrappedComponent, _props)
    } else {
      // Otherwise, call the original function.
      return WrappedComponent(_props, context, updater)
    }
  }

  AlfaProvidedComponent.keys = keys
  AlfaProvidedComponent.contextTypes = {
    alfaStore: PropTypes.object
  }

  return AlfaProvidedComponent
}

function createAlfaSubscribedComponent(WrappedComponent, inputs, outputs) {
  const keys = WrappedComponent.keys

  class AlfaSubscribedComponent extends Component {
    static contextTypes = {
      alfaStore: PropTypes.object
    }

    constructor(props, context, updater) {
      // Call the original constructor.
      super(props, context, updater)
      /* istanbul ignore next */
      const alfaStore = context && context.alfaStore
      // Get injected props which eventually will become state of the component.
      const injectedProps = getInjectedProps(inputs, outputs, alfaStore)
      // Merge injected props with props where the first one has higher priority.
      const _props = { ...props, ...injectedProps }
      // Get dynamic props.
      const dynamicProps = getDynamicProps(keys, _props, outputs, alfaStore)

      // Handle dymanic props.
      if (dynamicProps) {
        this.subKeys = [...inputs, ...dynamicProps.inputs]
        this.subMaps = dynamicProps.maps
        this.state = { ..._props, ...dynamicProps.props }
      } else {
        this.subKeys = inputs
        this.state = _props
      }

      // Save the store for subscribe/unsubscribe.
      this.store = alfaStore
      this.setState = this.setState.bind(this)
    }

    componentDidMount() {
      // Call `setState` when subscribed keys changed.
      this.store.subscribe(this.subKeys, this.setState, this.subMaps)
    }

    componentWillUnmount() {
      // Unsubcribe `setState` when component is about to unmount.
      this.store.unsubscribe(this.setState)
    }

    render() {
      // Render the original component with state as its props.
      return createElement(WrappedComponent, this.state)
    }
  }

  AlfaSubscribedComponent.keys = keys

  return AlfaSubscribedComponent
}

function getInjectedProps(inputs, outputs, alfaStore) {
  const stringInputs = inputs.filter(input => typeof input === 'string')
  const injectedProps = {
    ...alfaStore.get(stringInputs)
  }

  inputs.forEach(input => {
    if (
      isobject(input) &&
      /* istanbul ignore next */
      typeof input.alfaAction === 'function'
    ) {
      // Generate the final action function which can be called inside the
      // component.
      injectedProps[input.name] = input.alfaAction(alfaStore)
    }
  })

  // Need to inject set.
  if (inputs.indexOf('set') > -1) {
    injectedProps.set = alfaStore.setWithOutputs(outputs)
  }

  return injectedProps
}

/**
 * Load dependencies with the result of calling `keys` function of the component.
 *
 * This gives people the ability to load dynamic dependencies based on the props
 * of the component at runtime.
 * It makes a map between the dynamic names of the dependencies and the names
 * of the properties injected in `state` of the component.
 * That helps maintaining a simple naming system in the application code.
 *
 * @param  {Function} keys
 * @param  {Object} props
 * @param  {Array} outputs
 * @param  {Object} alfaStore
 * @return {Object}
 */
function getDynamicProps(keys, props, outputs, alfaStore) {
  var result

  if (keys && 'function' === typeof keys) {
    const _keys = keys(props)
    if (Array.isArray(_keys)) {
      // Array of input keys.  There's no mapping in this case.  Item in the
      // array is the name of the input key.  We use this array to get
      // dependencies directly from the store.
      result = {
        inputs: _keys,
        props: getInjectedProps(_keys, outputs, alfaStore)
      }
    } else if (isobject(_keys)) {
      // Object of mappings between injection keys and real input keys.
      const injectionKeys = Object.keys(_keys)
      const realInputs = injectionKeys.map(key => _keys[key])
      const _props = getInjectedProps(realInputs, outputs, alfaStore)
      const mappedProps = {}
      injectionKeys.forEach(key => (mappedProps[key] = _props[_keys[key]]))

      // Map outputs
      if (outputs && 'function' === typeof props.set) {
        // The `set` of `props` which is obtained from calling
        // `alfaStore.setWithOutputs(outputs)`
        const _setWithOutputs = props.set
        // Call `_setWithOutputs` with maps if
        props.set = function(key, value) {
          _setWithOutputs(key, value, _keys)
        }
      }

      result = { maps: _keys, props: mappedProps, inputs: realInputs }
    }
  }

  return result
}
