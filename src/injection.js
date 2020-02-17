import PropTypes from 'prop-types'
import { createElement } from 'react'
import { getProps } from './input'
import { normalize } from './common'

/**
 * Public API
 */

export function inject(WrappedComponent, inputs, outputs) {
  const [_inputs, _outputs, keys] = normalize(WrappedComponent, inputs, outputs)

  function AlfaInjectedComponent(props, context) {
    let _props = getProps(props, _inputs, _outputs, context && context.alfaStore, keys)

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
