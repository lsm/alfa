import test from 'tape'
import { provide, subscribe, createStore } from '../src'

test('Public alfa api exists', t => {
  t.is(typeof provide, 'function')
  t.is(typeof subscribe, 'function')
  t.is(typeof createStore, 'function')
  t.end()
})
