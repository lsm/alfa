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
  alfa.action = createAction(store)
  alfa.provide = createProvide(store)
  alfa.subscribe = createSubscribe(store)
  alfa.exposeSet = function() {
    alfa.set = store.set
    return alfa
  }

  return alfa
}


export default createAlfa()
