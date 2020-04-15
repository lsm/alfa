import PropTypes from 'prop-types'
import { createElement } from 'react'
import { getProps, validate } from './common'
import { ComponentType, FunctionComponent, ReactElement } from 'react'
import { ProviderContext } from './types'

/**
 * Inject HOF. It wraps a React component and inject dependencies from the
 * alfa store during rendering time.
 * @param WrappedComponent The React Component that receives the injected props.
 * @param inputKeys        A list of store keys to inject.
 * @param outputKeys       A list of store keys this component might modify.
 */
export function inject<P, IK extends string, DP = Pick<P, Exclude<keyof P, IK>>>(
  WrappedComponent: ComponentType<P>,
  inputKeys: IK[],
  outputKeys?: string[],
): FunctionComponent<DP> {
  validate(WrappedComponent, inputKeys, outputKeys)

  function AlfaInjectedComponent(props: DP, context?: ProviderContext): ReactElement {
    const _props = getProps<DP, P>(props, inputKeys, outputKeys, context?.alfaStore)

    if (WrappedComponent.prototype?.isReactComponent) {
      // Create an element if it's react component.
      return createElement(WrappedComponent, _props)
    } else {
      // Otherwise, call the original function.
      return (WrappedComponent as Function)(_props, context)
    }
  }

  AlfaInjectedComponent.contextTypes = { alfaStore: PropTypes.object }

  return AlfaInjectedComponent
}
