import test from 'ava'
import alfa, { action, provide, subscribe, createAlfa, createStore } from '../src'

test('Public alfa api exists', t => {
  t.is(typeof alfa, 'object')
  t.is(typeof action, 'function')
  t.is(typeof provide, 'function')
  t.is(typeof subscribe, 'function')
  t.is(typeof createAlfa, 'function')
  t.is(typeof createStore, 'function')
})

test('alfa() returns a new alfa instance', t => {
  var newAlfa = createAlfa()
  t.is(typeof newAlfa, 'object')
  t.is(typeof newAlfa.action, 'function')
  t.is(typeof newAlfa.provide, 'function')
  t.is(typeof newAlfa.subscribe, 'function')
})
