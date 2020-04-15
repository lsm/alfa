import PropTypes from 'prop-types'
import React, { Component, ReactNode, createElement,
  ReactElement, ComponentType } from 'react'

import Store from './store'
import { StoreKVObject, ProviderContext } from './types'
import { isObject } from './common'

/**
 * ProviderData. This could be several types:
 * 1. The initial data of the private store if it's an plain object.
 * 2. Nothing.  A private store will be created internally.
 */
type ProviderData = object | undefined;

/**
 * Props type of the Provider class.
 */
type ProviderProps = {
  data?: ProviderData;
}

function checkProviderData(data?: object): void | never {
  if (data && !isObject(data)) {
    throw new Error('Expect `data` to be a plain object.')
  }
}

/**
 * Class to provide alfa store as context for alfa-enabled component.
 */
export class Provider extends Component<ProviderProps> {

  store: Store

  // Instance of alfa store as a child context.
  static childContextTypes = { alfaStore: PropTypes.object.isRequired }

  constructor(props: ProviderProps, context: unknown) {
    super(props, context)
    checkProviderData(props.data)
    this.store = new Store(props.data)
  }

  shouldComponentUpdate({ data }: ProviderProps): boolean {
    checkProviderData(data)
    if (data) {
      this.store.merge(data as StoreKVObject)
    } else {
      this.store.reset()
    }
    return true
  }

  getChildContext(): ProviderContext {
    return { alfaStore: this.store }
  }

  render(): ReactNode {
    return this.props.children
  }
}

/**
 * Functional interface for creating alfa-enabled component.
 *
 * @param   WrappedComponent The user component that needs to access the alfa context.
 * @param   data The initial data of the provider .
 */
export function provide<P, T extends ComponentType<P>>(
  WrappedComponent: T,
  data: ProviderData,
): ComponentType<P> {
  return function Component(props): ReactElement<P, T> {
    return (
      <Provider data={data}>{createElement(WrappedComponent, props)}</Provider>
    )
  }
}
