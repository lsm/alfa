import PropTypes from 'prop-types'
import { Component, createElement, ComponentType } from 'react'

import Store from './store'
import { ProviderContext } from './types'
import { getProps, validate } from './common'

class Subscription<P> extends Component<P> {
  store?: Store

  inputKeys?: string[]

  static contextTypes = { alfaStore: PropTypes.object }

  constructor(props: P, context?: ProviderContext) {
    // Call the original constructor.
    super(props, context)

    // Save the store for subscribe/unsubscribe.
    this.store = context?.alfaStore

    // Use bound setState as subscription function.
    this.setState = this.setState.bind(this)
  }

  componentDidMount(): void {
    // Call `setState` when subscribed keys changed.
    if (this.store && this.inputKeys) {
      this.store.subscribe(this.inputKeys, this.setState)
    }
  }

  componentWillUnmount(): void {
    // Unsubcribe `setState` when component is about to unmount.
    this.store && this.store.unsubscribe(this.setState)
  }
}

export function subscribe<P, IK extends string, DP = Pick<P, Exclude<keyof P, IK>>>(
  WrappedComponent: ComponentType<P>,
  inputKeys: IK[],
  outputKeys?: string[],
): ComponentType<DP> {
  validate(WrappedComponent, inputKeys, outputKeys)

  class AlfaSubscribedComponent extends Subscription<DP> {
    inputKeys = inputKeys

    render(): React.ReactNode {
      // Render the original component with generated state as its props.
      const props = getProps<DP, P>(this.props, inputKeys, outputKeys, this.store)
      return createElement(WrappedComponent, props)
    }
  }

  return AlfaSubscribedComponent
}
