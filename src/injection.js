

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
      props = Object.assign(store.get(keys), props || {})

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
      if (props)
        _props = Object.assign(store.get(keys), props)
      else
        _props = store.get(keys)

      return createElement(WrappedComponent, _props)
    }
  })[componentName]
}


function createAlfaSubscribedComponent(store, Component, keys) {
  class AlfaSubscribedComponent extends Component {
    constructor(props, context) {
      // Call the original constructor.
      super(props, context)

      // State of parent constructor has higher priority than keys injected from
      // the store.
      this.state = {
        ...store.get(keys),
        ...this.state
      }

      if ('function' === typeof this.setState)
        store.subscribe(keys, this.setState)

      return this
    }
  }

  return AlfaSubscribedComponent
}
