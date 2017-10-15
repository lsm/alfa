import test from 'tape'
import { action, createStore } from '../src'


test('pipeline instance', t => {
  const store = createStore({
    arg1: 'value1',
    goNext: true,
    shouldStop: false,
    optionalFn: function() {}
  })
  const pipeline = action('test')
    .input('arg1')
    .pipe(function(arg1) {
      t.is(arg1, 'value1')

      return {
        arg2: 'value2',
        time: new Date()
      }
    }, ['arg1'], ['arg2', 'time'])
    .wait(200)
    .pipe('goNext')
    .pipe('optionalFn?', 'Nonexistent value')
    .pipe('!shouldStop')
    .pipe('nonexistent function?')
    .pipe(function(time) {
      const now = new Date()
      t.is(now - time >= 200, true)
    }, 'time')
    .output('arg2')
    .pipe(() => {
      t.is(store.get('arg2'), 'value2')
      t.end()
    })
    .pipe(set => {
      set('setKey', 'The value to set')
    }, 'set', 'setKey')
    .pipe(setKey => {
      t.is(setKey, 'The value to set')
    }, 'setKey')
    .error('errorHandler')

  pipeline(store)(store.get('arg1'))
})

test('error pipe', t => {
  t.plan(8)

  const error = 'Error message'

  action('function error handler with default arguments')
    .pipe(function() {
      return {
        error: error
      }
    })
    .pipe('error', function(err) {
      t.is(err, error)
      t.is(arguments.length, 1)
    })()()


  action('use .error() to define error handler')
    .pipe(function() {
      return {
        data: 'data',
        error: error
      }
    })
    .error(function(data, err) {
      t.is(data, 'data')
      t.is(err, error)
      t.is(arguments.length, 2)
    }, ['data', 'error'])()()


  const store = createStore({
    myErrFn: function(err, data) {
      t.is(err, error)
      t.is(data, 'data')
    }
  })

  action('load error handler from store')
    .pipe(function(next) {
      next(error, {
        data: 'data'
      })
    }, 'next', ['data'])
    .error('myErrFn', ['error', 'data'])(store)()


  t.throws(() => {
    action('erorr handler not exists')
      .pipe(function(next) {
        next('error')
      }, ['next'])()()
  }, Error)
})

test('pipeline with dynamic output', t => {
  t.plan(2)

  const store = createStore({
    arg1: 'value1'
  })
  const result = 'dynamic value'
  const pipeline = action('test dynamic output')
    .pipe((arg1) => {
      t.is(arg1, 'value1')
      return {
        result1: result
      }
    }, ['arg1'], ['result1'])
    .output(['arg1', 'result1:$arg1'])

  pipeline(store)()

  t.is(store.get('value1'), result)
})
