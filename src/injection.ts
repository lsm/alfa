import PropTypes from 'prop-types'
import { createElement } from 'react'
import { getProps, validate } from './common'
import { ComponentType, FunctionComponent, ReactElement } from 'react'
import { ProviderContext } from './types'

/**
 * Inject HOF. It wraps a React component and inject dependencies from the
 * alfa store during the rendering time.
 * @param WrappedComponent The React Component that receives the injected props.
 * @param inputKeys        A list of store keys to inject.
 * @param outputKeys       A list of store keys this component might modify.
 */
export function inject<P, OP = Omit<P, 'set'>,
  IK extends keyof P = keyof P,
  OK extends keyof OP = keyof OP,
  DP = Pick<P, Exclude<keyof P, IK>>,
  IP = Pick<P, Extract<keyof P, IK>>,
>(
  WrappedComponent: ComponentType<P>,
  inputKeys: IK[],
  outputKeys?: OK[],
): FunctionComponent<DP & Partial<IP>> {
  validate(WrappedComponent, inputKeys, outputKeys)

  function AlfaInjectedComponent(props: DP & Partial<IP>, context?: ProviderContext): ReactElement {
    const _props = getProps<P, IP, OP, IK, OK, DP>(
      props,
      inputKeys,
      outputKeys,
      context?.alfaStore,
    )

    if (WrappedComponent.prototype && WrappedComponent.prototype.isReactComponent) {
      // Create an element if it's react component.
      return createElement(WrappedComponent, _props as unknown as P)
    } else {
      // Otherwise, call the original function.
      return (WrappedComponent as Function)(_props, context)
    }
  }

  AlfaInjectedComponent.contextTypes = { alfaStore: PropTypes.object }

  return AlfaInjectedComponent
}
