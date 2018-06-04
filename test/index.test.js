import test from 'tape'
import { app, Store, action, inject, subscribe } from '../src'

test('Public alfa api exists', t => {
  t.is(typeof app, 'function')
  t.is(typeof Store, 'function')
  t.is(typeof action, 'function')
  t.is(typeof inject, 'function')
  t.is(typeof subscribe, 'function')
  t.end()
})
