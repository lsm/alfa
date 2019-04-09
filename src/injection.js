import isobject from 'isobject'
import PropTypes from 'prop-types'
import { Component, createElement } from 'react'

/**
 * Public API
 */

export const inject = createInjector('inject', createAlfaInjectedComponent)
export const subscribe = createInjector(
  'subscribe',
  createAlfaSubscribedComponent
)

/**
 * Private functions
 */

function createInjector(type, creator) {
  return function(WrappedComponent, inputs, outputs) {
    if (typeof WrappedComponent === 'function') {
      const componentName = WrappedComponent.name
      inputs = normalizeInputs(componentName, inputs, WrappedComponent.keys)
      outputs = normalizeOutputs(componentName, inputs, outputs)
      return creator(WrappedComponent, inputs, outputs)
    } else {
      // istanbul ignore next
      const error = `alfa.${type} only accepts function or class. Got "${typeof WrappedComponent}".`
      throw new TypeError(error)
    }
  }
}

export function normalizeInputs(name, inputs, dynamicInputs) {
  if (inputs && 'string' === typeof inputs) {
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
      `${name}: outputs are required as 3rd argument of function "inject/subscribe" when "set" is injected/subscribed.`
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

function createAlfaInjectedComponent(WrappedComponent, inputs, outputs) {
  const keys = typeof WrappedComponent.keys === 'function' ? WrappedComponent.keys : null

  function AlfaInjectedComponent(props, context, updater) {
    const alfaStore = context && context.alfaStore
    const injectedProps = getInjectedProps(inputs, outputs, alfaStore)
    // Props passed in directly to constructor has lower priority than inputs
    // injected from the store.
    var _props = { ...props, ...injectedProps }

    if (keys) {
      const dynamicInputs = getDynamicInputs(keys, _props, inputs)
      _props = getDynamicProps(dynamicInputs, outputs, alfaStore)
    }

    if (WrappedComponent.prototype.isReactComponent) {
      // Create an element if it's react component.
      return createElement(WrappedComponent, _props)
    } else {
      // Otherwise, call the original function.
      return WrappedComponent(_props, context, updater)
    }
  }

  AlfaInjectedComponent.keys = keys
  AlfaInjectedComponent.contextTypes = {
    alfaStore: PropTypes.object
  }

  return AlfaInjectedComponent
}

function createAlfaSubscribedComponent(WrappedComponent, inputs, outputs) {
  const keys = typeof WrappedComponent.keys === 'function' ? WrappedComponent.keys : null

  class AlfaSubscribedComponent extends Component {
    static contextTypes = {
      alfaStore: PropTypes.object
    }

    getState = (props, alfaStore) => {
      if (!alfaStore || this.silentVersion === alfaStore.silentVersion) {
        return this.state
      }
      // Sync silent version with alfa store
      this.silentVersion = alfaStore.silentVersion
      // Get injected props which is part of the state of the component.
      const injectedProps = getInjectedProps(inputs, outputs, alfaStore)

      // Merge injected props with props where the injectedProps has higher priority.
      const _props = { ...props, ...injectedProps }

      if (keys) {
        // Get dynamic inputs.
        const dynamicInputs = getDynamicInputs(keys, _props, inputs)
        this.maps = dynamicInputs.maps
        this.inputs = dynamicInputs.inputs
        // Get the props and return as state
        return getDynamicProps(dynamicInputs, outputs, alfaStore)
      } else {
        return _props
      }
    }

    componentDidMount() {
      // Call `setState` when subscribed keys changed.
      const store = this.context.alfaStore
      if (store) {
        this.setState = this.setState.bind(this)
        store.subscribe(this.inputs || inputs, this.setState, this.maps)
      }
    }

    componentWillUnmount() {
      // Unsubcribe `setState` when component is about to unmount.
      const store = this.context.alfaStore
      store && store.unsubscribe(this.setState)
    }

    render() {
      // Render the original component with state as its props.
      return createElement(WrappedComponent, this.getState(this.props, this.context.alfaStore))
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
function getDynamicProps({ keys, maps, inputs }, outputs, alfaStore) {
  const _props = getInjectedProps(inputs, outputs, alfaStore)

  if (maps) {
    keys.forEach(key => {
      _props[key] = _props[maps[key]]
    })
    // Map outputs
    if (outputs && 'function' === typeof _props.set) {
      // The `set` of `props` which is obtained from calling
      // `alfaStore.setWithOutputs(outputs)`
      const _setWithOutputs = _props.set
      // Call `_setWithOutputs` with maps if
      _props.set = function(key, value) {
        _setWithOutputs(key, value, maps)
      }
    }
    return _props
  } else {
    // No mapped props
    return _props
  }
}

function getDynamicInputs(getKeys, props, _inputs) {
  const inputs = getKeys(props)

  if (Array.isArray(inputs)) {
    return {
      inputs: [..._inputs, ...inputs]
    }
  } else if (isobject(inputs)) {
    // Object of mappings between injection keys and real input keys.
    const keys = Object.keys(inputs)
    const realInputs = keys.map(key => inputs[key])
    return {
      keys,
      maps: inputs,
      inputs: [..._inputs, ...realInputs]
    }
  }

  return {
    inputs: _inputs
  }
}
