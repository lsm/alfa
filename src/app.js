import PropTypes from 'prop-types'
import createStore from './store'
import { createElement, Component } from 'react'

/**
 * Wrap an component with alfa store.
 *
 * @param  {Class|Function}     WrappedComponent The user component which is being wrapped.
 * @param  {Store|Object|null}  data            This could be several types:
 *    1. Instance of alfa Store which will be used directly as the internal store object.
 *    2. The initial data of the private store if it's an plain object.
 *    3. Nothing.  A private store will be created internally.
 * @return {Class}              The wrapping component.
 */
export default function app(WrappedComponent, data) {
  var store

  // Handle different type of data.
  if (data) {
    store = data.isAlfaStore ? data : new Store(data)
  } else {
    store = new Store()
  }

  // Wrap the component with instance of alfa store as a context.
  class App extends Component {
    // eslint-disable-next-line
    constructor(props) {
      /* istanbul ignore next */
      super(props)
    }

    static childContextTypes = {
      alfaStore: PropTypes.object
    }

    getChildContext() {
      return {
        alfaStore: store
      }
    }

    render() {
      return createElement(WrappedComponent, this.props)
    }
  }

  return App
}
