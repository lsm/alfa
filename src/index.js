import createStore from './store'
import createAction from './action'
import { createProvide, createSubscribe } from './injection'

/**
 * Export function for creating a new alfa instance.
 * @return {Function}
 */
export function createAlfa() {
  const alfa = {}
  const store = createStore()

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
 * Export other toplevel APIs.
 */
export default alfa
export const action = alfa.action
export const provide = alfa.provide
export const subscribe = alfa.subscribe
export { default as app } from './app'
export { default as createStore } from './store'


