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
  alfa.set = store.set
  alfa.action = createAction(store)
  alfa.provide = createProvide(store)
  alfa.subscribe = createSubscribe(store)

  return alfa
}


export default createAlfa()
