import test from 'tape'
import { app, Store, action, inject, subscribe } from '../src'

test('Public alfa api exists', t => {
  t.is(typeof inject, 'function')
  t.is(typeof subscribe, 'function')
  t.is(typeof createStore, 'function')
  t.end()
})
