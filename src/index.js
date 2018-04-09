import createStore from './store'
import { createInjector } from './injection'

/**
 * Export function for creating a new alfa instance.
 * @return {Function}
 */
export function createAlfa() {
  const alfa = {}
  const store = createStore()

  alfa.provide = createInjector(store, 'provide')
  alfa.subscribe = createInjector(store, 'subscribe')

  return alfa
}

/**
 * Default global instance of alfa.
 * @type {Function}
 */
const alfa = createAlfa()

/**
 * Export default
 */
export default alfa

/**
 * Export other toplevel APIs.
 */
export const provide = alfa.provide
export const subscribe = alfa.subscribe
export { default as app } from './app'
export { default as createStore } from './store'
