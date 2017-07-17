import createStore from './store'
import createAction from './action'
import { createProvide, createSubscribe } from './injection'


function createAlfa() {
  function alfa() {
    return createAlfa()
  }

  var store = createStore()

  alfa.action = createAction(store)
  alfa.provide = createProvide(store)
  alfa.subscribe = createSubscribe(store)

  return alfa
}


/**
 * Default global instance of alfa.
 * @type {Function}
 */
const alfa = createAlfa()


/**
 * Export toplevel APIs.
 */
export default alfa
export const action = alfa.action
export const provide = alfa.provide
export const subscribe = alfa.subscribe
export { default as createStore } from './store'

