import PropTypes from 'prop-types'
import { Component, createElement } from 'react'

/**
 * Public API
 */

export function createProvide(store) {
  return function provide(WrappedComponent, keys) {
    if ('function' === typeof WrappedComponent) {
      keys = normalizeKeys(keys, 'provide', WrappedComponent.keys)
      return createAlfaProvidedComponent(store, WrappedComponent, keys,
        isReactComponent(WrappedComponent) && 'component')
    } else {
      throw new TypeError('alfa.provide only accepts function or class.')
    }
  }
}

export function createSubscribe(store) {
  return function subscribe(WrappedComponent, keys) {
    if ('function' === typeof WrappedComponent) {
      keys = normalizeKeys(keys, 'subscribe', WrappedComponent.keys)
      return createAlfaSubscribedComponent(store, WrappedComponent, keys)
    } else {
      throw new TypeError('alfa.subscribe only accepts function or class.')
    }
  }
}


/**
 * Private functions
 */

function normalizeKeys(keys, name, dynamicKeys) {
  if ('string' === typeof keys)
    return [keys]
  else if (Array.isArray(keys))
    return keys
  else if ('function' === typeof dynamicKeys)
    return []
  else
    throw new TypeError(`"${name}" only accepts string or array of strings as second parameter when static property 'keys' of component not exists.`)
}


function isReactComponent(Component) {
  return Component.prototype && Component.prototype.isReactComponent
}


function createAlfaProvidedComponent(store, WrappedComponent, keys, type) {
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
        store, context && context.alfaStore)
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


function createAlfaSubscribedComponent(store, WrappedComponent, keys) {
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

      // Get dynamic props.
      const dynamicProps = getDynamicProps(WrappedComponent.keys,
        {
          ...props,
          ...state
        }, store, context && context.alfaStore)

      // var maps
      if (dynamicProps) {
        this.subKeys = [...keys, ...dynamicProps.keys]
        this.subMaps = dynamicProps.maps
        this.state = {
          ...state,
          ...dynamicProps.props
        }
      } else {
        this.subKeys = keys
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
      // State injected may change during normal component lifecycle.
      // So in this case it has higher priority than props.
      var _props = {
        ...this.props,
        ...this.state
      }

      // State and props are merged and passed to wrapped component as props.
      return createElement(WrappedComponent, _props)
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

function getDynamicProps(keys, props, store, contextStore) {
  if (keys && 'function' === typeof keys) {
    const _keys = keys(props)
    if (Array.isArray(_keys)) {
      return {
        keys: _keys,
        props: getInjectedProps(_keys, store, contextStore)
      }
    } else if (_keys && 'object' === typeof _keys) {
      const injectionKeys = Object.keys(_keys)
      const realkeys = injectionKeys.map(function(key) {
        return _keys[key]
      })
      const _props = getInjectedProps(realkeys, store, contextStore)
      const result = {}

      injectionKeys.forEach(function(key) {
        const realKey = _keys[key]
        result[key] = _props[realKey]
      })

      return {
        keys: realkeys,
        maps: _keys,
        props: result
      }
    }
  }
}
