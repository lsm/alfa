import PropTypes from 'prop-types'
import { PureComponent, createElement } from 'react'

/**
 * Public API
 */

export const provide = createInjector('provide')
export const subscribe = createInjector('subscribe')

/**
 * Private functions
 */

function createInjector(type) {
  const wrapper = {
    [type]: function(WrappedComponent, inputs, outputs) {
      const typeofComponent = typeof WrappedComponent
      if (typeofComponent === 'function') {
        const componentName = WrappedComponent.name
        inputs = normalizeInputs(componentName, inputs, WrappedComponent.keys)
        outputs = normalizeOutputs(componentName, inputs, outputs)
        const creator =
          type === 'provide'
            ? createAlfaProvidedComponent
            : createAlfaSubscribedComponent
        return creator(
          WrappedComponent,
          inputs,
          outputs,
          WrappedComponent.prototype &&
            WrappedComponent.prototype.isReactComponent &&
            'component'
        )
      } else {
        throw new TypeError(
          `alfa.${type} only accepts function or class.
          Got "${typeofComponent}".`
        )
      }
    }
  }

  return wrapper[type]
}

export function normalizeInputs(name, inputs, dynamicInputs) {
  if (
    inputs &&
    ('string' === typeof inputs ||
      (typeof inputs === 'object' && typeof inputs.alfaAction === 'function'))
  ) {
    return [inputs]
  } else if (Array.isArray(inputs)) {
    return inputs
  } else if ('function' === typeof dynamicInputs) {
    return []
  } else {
    throw new TypeError(`${name}: provide/subscribe only accepts string or array
     of strings as second parameter (inputs) when static property 'inputs' of 
     component does not exist.`)
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
      `${name}: outputs are required as 3rd argument of function 
"provide/subscribe" when "set" is provided/subscribed.`
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
    throw new TypeError(`${name}: provide/subscribe only accepts string or array
     of strings as 3rd parameter (outputs).`)
  }
}

function createAlfaProvidedComponent(WrappedComponent, inputs, outputs, type) {
  // Keep the name of the orginal component which makes debugging logs easier
  // to understand.
  var componentName = WrappedComponent.name || 'AlfaProvidedComponent'

  var wrapper = {
    [componentName]: function(props, context, updater) {
      const injectedProps = getInjectedProps(inputs, outputs, context.alfaStore)
      // Props passed in directly to constructor has lower priority than inputs
      // injected from the store.
      var _props = {
        ...props,
        ...injectedProps
      }

      const dynamicProps = getDynamicProps(
        WrappedComponent.keys,
        _props,
        outputs,
        context && context.alfaStore
      )

      // Dynamic props have higher priority than static props.
      if (dynamicProps) {
        _props = {
          ..._props,
          ...dynamicProps.props
        }
      }

      if ('component' === type) {
        // Create an element if it's react component.
        return createElement(WrappedComponent, _props)
      } else {
        // Otherwise, call the original function.
        return WrappedComponent(_props, context, updater)
      }
    }
  }

  wrapper[componentName].contextTypes = {
    alfaStore: PropTypes.object
  }

  if (WrappedComponent.keys) {
    wrapper[componentName].keys = WrappedComponent.keys
  }

  return wrapper[componentName]
}

function createAlfaSubscribedComponent(WrappedComponent, inputs, outputs) {
  var classHolder = {
    // Keep the name of the orginal component which makes debugging logs easier
    // to understand.
    [WrappedComponent.name]: class AlfaSubscribedComponent extends PureComponent {
      static contextTypes = {
        alfaStore: PropTypes.object
      }

      constructor(props, context, updater) {
        // Call the original constructor.
        super(props, context, updater)

        // Inject all inputs as state.
        const contextStore = context && context.alfaStore
        const state = getInjectedProps(inputs, outputs, contextStore)
        // Merge state and props which state has higher priority.
        const _props = {
          ...props,
          ...state
        }

        // Get dynamic props.
        const dynamicProps = getDynamicProps(
          WrappedComponent.keys,
          _props,
          outputs,
          contextStore
        )

        // var maps
        if (dynamicProps) {
          this.subKeys = [...inputs, ...dynamicProps.inputs]
          this.subMaps = dynamicProps.maps
          this.state = {
            ..._props,
            ...dynamicProps.props
          }
        } else {
          this.subKeys = inputs
          this.state = _props
        }

        // Save the store for subscribe/unsubscribe.
        this.store = contextStore
        this.subFunc = this.setState.bind(this)
      }

      componentDidMount() {
        // Call `setState` when subscribed keys changed.
        this.store.subscribe(this.subKeys, this.subFunc, this.subMaps)
      }

      componentWillUnmount() {
        'function' === typeof this.subFunc &&
          this.store.unsubscribe(this.subFunc)
      }

      render() {
        return createElement(WrappedComponent, this.state)
      }
    }
  }

  if (WrappedComponent.keys) {
    classHolder[WrappedComponent.name].keys = WrappedComponent.keys
  }

  return classHolder[WrappedComponent.name]
}

function getInjectedProps(inputs, outputs, contextStore) {
  const stringInputs = inputs.filter(input => typeof input === 'string')
  const injectedProps = {
    ...contextStore.get(stringInputs)
  }

  // Need to inject set.
  if (inputs.indexOf('set') > -1) injectedProps.set = contextStore.set

  Object.keys(injectedProps).forEach(function(key) {
    const prop = injectedProps[key]
    if ('function' === typeof prop && true === prop.isAlfaPipeline)
      injectedProps[key] = prop(contextStore)
  })

  return injectedProps
}

function getDynamicProps(inputs, props, outputs, contextStore) {
  var result
  if (inputs && 'function' === typeof inputs) {
    const _keys = inputs(props)
    if (Array.isArray(_keys)) {
      result = {
        inputs: _keys,
        props: getInjectedProps(_keys, contextStore)
      }
    } else if (_keys && 'object' === typeof _keys) {
      const injectionKeys = Object.keys(_keys)
      const realInputs = injectionKeys.map(function(key) {
        return _keys[key]
      })
      const _props = getInjectedProps(realInputs, contextStore)
      const mappedProps = {}

      injectionKeys.forEach(function(key) {
        const realKey = _keys[key]
        mappedProps[key] = _props[realKey]
      })

      result = {
        maps: _keys,
        props: mappedProps,
        inputs: realInputs
      }
    }
  }

  // Map and check outputs
  if (outputs && 'function' === typeof props.set) {
    const _set = props.set
    const maps = result && result.maps
    props.set = function(key, value) {
      if ('object' === typeof key) {
        Object.keys(key).forEach(function(_key) {
          props.set(_key, key[_key])
        })
        return
      }
      // The outputs key is a dynamic key.  Set with its real key.
      if (maps && maps[key]) {
        key = maps[key]
      } else if (-1 === outputs.indexOf(key)) {
        // Check if the output key is allowed.
        throw new Error(`Output key "${key}" is not allowed.  You need to
              define it as an output when calling provide/subscribe.`)
      }

      _set(key, value)
    }
  }

  return result
}
