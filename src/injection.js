import isobject from 'isobject'
import PropTypes from 'prop-types'
import { Component, createElement } from 'react'

/**
 * Public API
 */

export function inject(WrappedComponent, inputs, outputs) {
  const [_inputs, _outputs, keys] = normalize(WrappedComponent, inputs, outputs)

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
