import PropTypes from 'prop-types'
import { Component, createElement } from 'react'

/**
 * Public API
 */

export function createProvide(store) {
  return function provide(WrappedComponent, keys, output) {
    if ('function' === typeof WrappedComponent) {
      const componentName = WrappedComponent.name
      keys = normalizeKeys(componentName, keys, WrappedComponent.keys)
      checkOutput(componentName, keys, output)
      return createAlfaProvidedComponent(store, WrappedComponent, keys, output,
        isReactComponent(WrappedComponent) && 'component')
    } else {
      throw new TypeError('alfa.provide only accepts function or class.')
    }
  }
}

export function createSubscribe(store) {
  return function subscribe(WrappedComponent, keys, output) {
    if ('function' === typeof WrappedComponent) {
      const componentName = WrappedComponent.name
      keys = normalizeKeys(componentName, keys, WrappedComponent.keys)
      checkOutput(componentName, keys, output)
      return createAlfaSubscribedComponent(store, WrappedComponent, keys, output)
    } else {
      throw new TypeError('alfa.subscribe only accepts function or class.')
    }
  }
}


/**
 * Private functions
 */

function normalizeKeys(name, keys, dynamicKeys) {
  if ('string' === typeof keys) {
    return [keys]
  } else if (Array.isArray(keys)) {
    return keys
  } else if ('function' === typeof dynamicKeys) {
    return []
  } else {
    throw new TypeError(`${name}: provide/subscribe only accepts string or array
     of strings as second parameter when static property 'keys' of component
     does not exist.`)
  }
}

function checkOutput(name, keys, output) {
  if (Array.isArray(keys)) {
    if (keys.indexOf('set') > -1
      && (!Array.isArray(output) || 0 === output.length)) {
      throw new Error(`${name}: array of output keys should be provided as 3rd
argument of function "provide/subscribe" when "set" is provided/subscribed.`)
    }
  }
}


function isReactComponent(Component) {
  return Component.prototype && Component.prototype.isReactComponent
}


function createAlfaProvidedComponent(store, WrappedComponent, keys, output, type) {
  // Keep the name of the orginal component which makes debugging logs easier
  // to understand.
  var componentName = WrappedComponent.name || 'AlfaProvidedComponent'

  var wrapper = {
    [componentName]: function(props, context, updater) {
      const injectedProps = getInjectedProps(keys, store,
        context && context.alfaStore)
      // Props passed in directly to constructor has lower priority than keys
      // injected from the store.
      var _props = {
        ...props,
        ...injectedProps
      }

      const dynamicProps = getDynamicProps(WrappedComponent.keys, _props,
        output, store, context && context.alfaStore)
      if (dynamicProps) {
        _props = {
          ..._props,
          ...dynamicProps.props
        }
      }

      if ('component' === type)
        // Create an element if it's react component.
        return createElement(WrappedComponent, _props)
      else
        // Otherwise, call the original function.
        return WrappedComponent(_props, context, updater)
    }
  }

  wrapper[componentName].contextTypes = {
    alfaStore: PropTypes.object
  }

  if (WrappedComponent.keys)
    wrapper[componentName].keys = WrappedComponent.keys

  return wrapper[componentName]
}


function createAlfaSubscribedComponent(store, WrappedComponent, keys, output) {
  class AlfaSubscribedComponent extends Component {
    // Keep the name of the orginal component which makes debugging logs easier
    // to understand.
    static get name() {
      return WrappedComponent.name
    }

    static contextTypes = {
      alfaStore: PropTypes.object
    }

    constructor(props, context, updater) {
      // Call the original constructor.
      super(props, context, updater)

      // Inject all keys as state.
      const contextStore = context && context.alfaStore
      const state = getInjectedProps(keys, store, contextStore)
      const _props = {
        ...props,
        ...state
      }

      // Get dynamic props.
      const dynamicProps = getDynamicProps(WrappedComponent.keys, _props,
        output, store, context && context.alfaStore)

      // var maps
      if (dynamicProps) {
        this.subKeys = [...keys, ...dynamicProps.keys]
        this.subMaps = dynamicProps.maps
        if (_props.set)
          state.set = _props.set
        this.state = {
          ...state,
          ...dynamicProps.props
        }
      } else {
        this.subKeys = keys
        if (_props.set)
          state.set = _props.set
        this.state = state
      }

      // Use the correct store for subscribe/unsubscribe.
      this.store = contextStore || store
      this.subFunc = this.setState.bind(this)
    }

    componentDidMount() {
      // Call `setState` when subscribed keys changed.
      this.store.subscribe(this.subKeys, this.subFunc, this.subMaps)
    }

    componentWillUnmount() {
      'function' === typeof this.subFunc && this.store.unsubscribe(this.subFunc)
    }

    render() {
      const props = {
        ...this.props,
        ...this.state
      }
      // State and props are merged and passed to wrapped component as props.
      return createElement(WrappedComponent, props)
    }
  }

  if (WrappedComponent.keys)
    AlfaSubscribedComponent.keys = WrappedComponent.keys

  return AlfaSubscribedComponent
}

function getInjectedProps(keys, store, contextStore) {
  const injectedProps = {
    ...store.get(keys),
    // See if we have an alternative alfa store to use.
    ...(contextStore ? contextStore.get(keys) : undefined)
  }

  // Need to inject set.
  if (keys.indexOf('set') > -1)
    injectedProps.set = (contextStore || store).set

  Object.keys(injectedProps).forEach(function(key) {
    const prop = injectedProps[key]
    if ('function' === typeof prop && true === prop.isAlfaPipeline)
      injectedProps[key] = prop(contextStore || store)
  })

  return injectedProps
}

function getDynamicProps(keys, props, output, store, contextStore) {
  var result
  if (keys && 'function' === typeof keys) {
    const _keys = keys(props)
    if (Array.isArray(_keys)) {
      result = {
        keys: _keys,
        props: getInjectedProps(_keys, store, contextStore)
      }
    } else if (_keys && 'object' === typeof _keys) {
      const injectionKeys = Object.keys(_keys)
      const realkeys = injectionKeys.map(function(key) {
        return _keys[key]
      })
      const _props = getInjectedProps(realkeys, store, contextStore)
      const mappedProps = {}

      injectionKeys.forEach(function(key) {
        const realKey = _keys[key]
        mappedProps[key] = _props[realKey]
      })

      result = {
        keys: realkeys,
        maps: _keys,
        props: mappedProps
      }
    }
  }

  // Map and check output
  if (output && 'function' === typeof props.set) {
    const _set = props.set
    const maps = result && result.maps
    props.set = function(key, value) {
      // The output key is a dynamic key.  Set with its real key.
      if (maps && maps[key]) {
        key = maps[key]
      } else if (-1 === output.indexOf(key)) {
        // Check if the output key is allowed.
        throw new Error(`Output key "${key}" is not allowed.  You need to
              defined it as an output when calling provide/subscribe.`)
      }

      _set(key, value)
    }
  }

  return result
}
