import test from 'tape'
import { Store, action, inject, provide, Provider, subscribe } from '../src'

test('Public alfa api exists', t => {
  t.is(typeof Store, 'function')
  t.is(typeof action, 'function')
  t.is(typeof inject, 'function')
  t.is(typeof provide, 'function')
  t.is(typeof Provider, 'function')
  t.is(typeof subscribe, 'function')
  t.end()
})
