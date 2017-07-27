import PropTypes from 'prop-types'
import createStore from './store'
import { createElement, Component } from 'react'

/**
 * Wrap an component with alfa store.
 * 
 * @param  {Class|Function}     WrappedComponent The user component which is being wrapped.
 * @param  {Store|Object|null}  store            This could be several types:
 *    1. Instance of alfa Store which will be used directly as the internal store object.
 *    2. The initial data of the store if it's an plain object.
 *    3. Nothing.  A private store will be created internally.
 * @return {Class}              The wrapping component.
 */
export default function app(WrappedComponent, store) {
  var _store

  if (store) {
    if (true === store.isAlfaStore)
      _store = store
    else
      _store = createStore(store)
  } else {
    _store = createStore()
  }

  class App extends Component {

    static childContextTypes = {
      alfaStore: PropTypes.object
    }

    getChildContext() {
      return {
        alfaStore: _store
      }
    }

    render() {
      return createElement(WrappedComponent, this.props)
    }
  }

  return App
}
