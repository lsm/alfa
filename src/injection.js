import { Component, createElement } from 'react'

/**
 * Public API
 */

export function createProvide(store) {
  return function provide(Component, keys) {
    if (isReactComponent(Component))
      return createAlfaProvidedComponent(store, Component, keys)
    else
      return createAlfaProvidedFunction(store, Component, keys)
  }
}

export function createSubscribe(store) {
  return function subscribe(Component, keys) {
    if (isReactComponent(Component))
      return createAlfaSubscribedComponent(store, Component, keys, 'subscribe')
    else
      throw new Error('alfa.subscribe only accepts ReactComponent.')
  }
}


/**
 * Private functions
 */


function isReactComponent(Component) {
  return Component.prototype && Component.prototype.isReactComponent
}


function createAlfaProvidedFunction(store, WrappedFunction, keys) {
  // Keep the name of the orginal function which makes debugging logs easier
  // to understand.
  var funcName = WrappedFunction.name || 'AlfaProvidedFunction'

  return ({
    [funcName]: function(props, context, updater) {
      // Props passed in directly to constructor has higher priority than keys
      // injected from the store.
      // Note: We can certainly define and get a non-global store instance from 
      // context.  But, the question is - what are the benefits?
      props = {
        ...store.get(keys),
        ...props || {}
      }

      // Call the original function.
      return WrappedFunction(props, context, updater)
    }
  })[funcName]
}

function createAlfaProvidedComponent(store, WrappedComponent, keys) {
  // Keep the name of the orginal component which makes debugging logs easier
  // to understand.
  var componentName = WrappedComponent.name || 'AlfaProvidedComponent'

  return ({
    [componentName]: function(props) {
      var _props
      // Props passed in directly to constructor has higher priority than keys
      // injected from the store.
      if (props) {
        _props = {
          ...store.get(keys),
          ...props
        }
      } else {
        _props = store.get(keys)
      }

      return createElement(WrappedComponent, _props)
    }
  })[componentName]
}


function createAlfaSubscribedComponent(store, WrappedComponent, keys) {
  var subFunc

  class AlfaSubscribedComponent extends Component {
    // Keep the name of the orginal component which makes debugging logs easier
    // to understand.
    static get name() {
      return WrappedComponent.name
    }

    constructor(props, context, updater) {
      // Call the original constructor.
      super(props, context, updater)

      // State of parent constructor has higher priority than keys injected from
      // the store.
      var state = store.get(keys)
      if (this.state) {
        this.state = {
          ...state,
          ...this.state
        }
      } else {
        this.state = state
      }

      // Call `setState` when subscribed keys changed.
      if ('function' === typeof this.setState) {
        subFunc = this.setState.bind(this)
        store.subscribe(keys, subFunc)
      }

      return this
    }

    componentWillUnmount() {
      'function' === typeof subFunc && store.unsubscribe(subFunc)
    }

    render() {
      var _props = {
        ...this.props || {},
        ...this.state
      }
      return createElement(WrappedComponent, _props)
    }
  }

  return AlfaSubscribedComponent
}
