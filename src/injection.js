

/**
 * Public API
 */

export function createProvide(alfa) {
  return function provide(Component, ...keys) {
    if (isReactComponent(Component))
      return createAlfaProvidedComponent(alfa, Component, keys)
    else
      return createAlfaProvidedFunction(alfa, Component, keys)
  }
}

export function createSubscribe(alfa) {
  return function subscribe(Component, ...keys) {
    if (isReactComponent(Component))
      return createAlfaSubscribedComponent(alfa, Component, keys, 'subscribe')
    else
      throw new Error('alfa.subcribe only accepts ReactComponent.')
  }
}


/**
 * Private functions
 */


function isReactComponent(Component) {
  return Component.prototype && Component.prototype.isReactComponent
}


function createAlfaProvidedFunction(alfa, Func, keys) {
  function AlfaProvidedFunction(props, context) {
    // Props passed in directly to constructor has higher priority than keys
    // injected from the alfa store.
    // Note: We can certainly define and get a non-global alfa instance from 
    // context.  But, the question is - what are the benefits?
    props = {
      ...alfa.get(keys),
      ...props
    }

    // Call the original function.
    return Func(props, context)
  }

  return AlfaProvidedFunction
}

function createAlfaProvidedComponent(alfa, Component, keys) {
  class AlfaProvidedComponent extends Component {
    constructor(props, context) {
      // Props passed in directly to constructor has higher priority than keys
      // injected from the alfa store.
      props = {
        ...alfa.get(keys),
        ...props
      }

      // Call the original constructor.
      super(props, context)
    }
  }

  return AlfaProvidedComponent
}


function createAlfaSubscribedComponent(alfa, Component, keys) {
  class AlfaSubscribedComponent extends Component {
    constructor(props, context) {
      // Call the original constructor.
      super(props, context)

      // State of parent constructor has higher priority than keys injected from
      // the alfa store.
      this.state = {
        ...alfa.get(keys),
        ...this.state
      }

      alfa.onKeysChanged(keys, this.setState)

      return this
    }
  }

  return AlfaSubscribedComponent
}
