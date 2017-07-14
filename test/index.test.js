import test from 'ava'
import alfa, { createStore } from '../src'

test('Public alfa api exists', t => {
  t.is(typeof alfa, 'function')
  t.is(typeof alfa.get, 'function')
  t.is(typeof alfa.set, 'function')
  t.is(typeof alfa.action, 'function')
  t.is(typeof alfa.provide, 'function')
  t.is(typeof alfa.subscribe, 'function')
  t.is(typeof createStore, 'function')
});

test('alfa() returns a new alfa instance', t => {
  var newAlfa = alfa()
  t.is(typeof newAlfa, 'function')
  t.is(typeof newAlfa.get, 'function')
  t.is(typeof newAlfa.set, 'function')
  t.is(typeof newAlfa.action, 'function')
  t.is(typeof newAlfa.provide, 'function')
  t.is(typeof newAlfa.subscribe, 'function')
})
