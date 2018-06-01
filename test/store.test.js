import test from 'tape'
import { createStore } from '../src'

const data = {
  a: 1,
  b: {
    c: new Date()
  }
}

test('store.set(key, value)', t => {
  t.plan(2)
  const store = createStore()
  store.set('key', 'value')
  t.is(store.get('key'), 'value', 'Set & get string value')

  const obj = {}
  store.set('an object', obj)
  t.is(store.get('an object'), obj, 'Set & get object value')
})

test('store.set(plainObject)', t => {
  t.plan(2)
  const store = createStore()
  store.set(data)

  t.is(store.get('a'), data.a)
  t.is(store.get('b'), data.b)
})

test('store.set with invalidate key', t => {
  t.plan(3)
  const store = createStore()

  t.throws(() => {
    store.set(true, true)
  }, 'Type of `key` must be string or plain object.')

  t.throws(() => {
    store.set(null)
  }, 'Type of `key` must be string or plain object.')

  t.throws(() => {
    store.set(function() {})
  }, 'Type of `key` must be string or plain object.')
})

test('store.get() -> shallow clone', t => {
  t.plan(4)
  const store = createStore()
  store.set(data)

  const clone = store.get()

  t.not(clone, data)
  t.is(clone.a, data.a)
  t.is(clone.b, data.b)
  t.is(clone.b.c, data.b.c)
})

test('store.get(keys)', t => {
  t.plan(4)
  const store = createStore()
  store.set(data)
  store.set('key', 'value')

  var result = store.get(['a', 'b', 'c'])

  t.is(result.a, data.a)
  t.is(result.b, data.b)
  t.is(result.key, undefined)
  t.is(result.hasOwnProperty('c'), false)
})

test('store.get() with invalidate key', t => {
  t.plan(4)
  const store = createStore()
  const errMsg = 'Type of `key` must be string, array of strings or undefined.'

  t.throws(() => {
    store.get(true)
  }, errMsg)

  t.throws(() => {
    store.get({})
  }, errMsg)

  t.throws(() => {
    store.get(null)
  }, errMsg)

  t.throws(() => {
    store.get([123])
  }, errMsg)
})

test('store.subscribe()', t => {
  t.plan(5)

  const store = createStore({
    a: 1,
    b: {
      c: new Date()
    },
    d: true,
    e: 'value which will not be changed'
  })

  store.subscribe(['e'], function() {
    throw new Error('`e` should not be changed.')
  })

  store.subscribe(['a'], function(changed) {
    t.is(changed.a, 2)
  })
  store.subscribe(['a'], function(changed) {
    t.is(changed.a, 2)
  })
  store.set('a', 2)

  store.subscribe(['b', 'd'], function(changed) {
    if (changed.b) {
      t.is(changed.b, b)
    }

    if (changed.d) {
      t.is(changed.d, 'false')
    }
  })

  const b = {
    today: 'Today is Friday'
  }
  store.set('b', b)
  store.set('d', 'false')

  t.throws(() => {
    store.subscribe(['key1'], {})
  }, '`fn` must be a function')
})

test('store.unsubscribe()', t => {
  t.plan(1)
  const store = createStore()

  function sub(changed) {
    t.is(changed.key, 'value')
  }

  store.subscribe(['key'], sub)
  store.set('key', 'value')
  store.unsubscribe(sub)
  store.set('key', 'changed value')
})
