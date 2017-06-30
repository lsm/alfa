import createStore from './store'
import createAction from './action'
import { createProvide, createSubscribe } from './injection'


export function createAlfa(name) {
  function alfa(name) {
    return createAlfa(name)
  }

  if (name)
    alfa.name = name

  var store = createStore()
  alfa.get = store.get
  alfa.onKeysChanged = store.onKeysChanged

  alfa.action = createAction(alfa)
  alfa.provide = createProvide(alfa)
  alfa.subscribe = createSubscribe(alfa)
  alfa.exposeSet = function() {
    alfa.set = store.set
    return alfa
  }

  return alfa
}


export default createAlfa()
