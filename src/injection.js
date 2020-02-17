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

  function AlfaInjectedComponent(props, context) {
    const alfaStore = context && context.alfaStore
    let _props

    if (alfaStore) {
      const injectedProps = getInjectedProps(inputs, outputs, alfaStore)
      // Props passed in directly to constructor has lower priority than inputs
      // injected from the store.
      _props = { ...props, ...injectedProps }

      if (keys) {
        const dynamicInputs = getDynamicInputs(keys, _props, inputs)
        _props = getDynamicProps(dynamicInputs, outputs, alfaStore)
      }
    } else {
      _props = props
    }

    if (WrappedComponent.prototype.isReactComponent) {
      // Create an element if it's react component.
      return createElement(WrappedComponent, _props)
    } else {
      // Otherwise, call the original function.
      return WrappedComponent(_props, context)
    }
  }

  AlfaInjectedComponent.keys = keys
  AlfaInjectedComponent.contextTypes = {
    alfaStore: PropTypes.object
  }

  return AlfaInjectedComponent
}
