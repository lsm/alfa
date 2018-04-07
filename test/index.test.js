import test from 'tape'
import alfa, { provide, subscribe, createAlfa, createStore } from '../src'

test('Public alfa api exists', t => {
  t.is(typeof alfa, 'object')
  t.is(typeof provide, 'function')
  t.is(typeof subscribe, 'function')
  t.is(typeof createAlfa, 'function')
  t.is(typeof createStore, 'function')
  t.end()
})

test('alfa() returns a new alfa instance', t => {
  var newAlfa = createAlfa()
  t.is(typeof newAlfa, 'object')
  t.is(typeof newAlfa.provide, 'function')
  t.is(typeof newAlfa.subscribe, 'function')
  t.end()
})
