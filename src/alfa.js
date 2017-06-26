import createStore from './store'
import createAction from './action'
import { createProvide, createSubscribe } from './injection'


export function createAlfa(name) {
  function alfa(name) {
    return createAlfa(name)
  }

  if (name)
    alfa.name = alfa

  var store = createStore()
  alfa.set = store.set
  alfa.get = store.get
  alfa.onKeysChanged = store.onKeysChanged

  alfa.action = createAction(alfa)
  alfa.provide = createProvide(alfa)
  alfa.subscribe = createSubscribe(alfa)

  return alfa
}


export default createAlfa()
