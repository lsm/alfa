import test from 'ava'
import alfa, { action, provide, subscribe, createStore } from '../src'

test('Public alfa api exists', t => {
  t.is(typeof alfa, 'function')
  t.is(typeof action, 'function')
  t.is(typeof provide, 'function')
  t.is(typeof subscribe, 'function')
  t.is(typeof createStore, 'function')
})

test('alfa() returns a new alfa instance', t => {
  var newAlfa = alfa()
  t.is(typeof newAlfa, 'function')
  t.is(typeof newAlfa.action, 'function')
  t.is(typeof newAlfa.provide, 'function')
  t.is(typeof newAlfa.subscribe, 'function')
})
