import PropTypes from 'prop-types'
import React, { Children, Component, createElement } from 'react'

import Store from './store'

/**
 * Class to make alfa-enabled component.
 */
export class Provider extends Component {
  constructor(props, context) {
    super(props, context)
    /* istanbul ignore next */

    // Handle different type of data.
    const data = props.data
    if (data) {
      this.store = data.isAlfaStore ? data : new Store(data)
    } else {
      this.store = new Store()
    }
  }

  // Instance of alfa store as a child context.
  static childContextTypes = {
    alfaStore: PropTypes.object.isRequired
  }

  getChildContext() {
    return {
      alfaStore: this.store
    }
  }

  render() {
    return Children.only(this.props.children)
  }
}

/**
 * Functional interface for creating alfa-enabled component.
 *
 * @param  {Class|Function}     WrappedComponent The user component which is being wrapped.
 * @param  {Store|Object|null}  data            This could be several types:
 *    1. Instance of alfa Store which will be used directly as the internal store object.
 *    2. The initial data of the private store if it's an plain object.
 *    3. Nothing.  A private store will be created internally.
 * @return {Class}              The wrapping component.
 */
export function provide(WrappedComponent, data) {
  return function(props) {
    return (
      <Provider data={data}>{createElement(WrappedComponent, props)}</Provider>
    )
  }
}
