import test from 'ava'
import React from 'react'
import getApp from './app'
import render from 'react-test-renderer'
import createAction from '../src/action'
import { createStore } from '../src'
import { createProvide, createSubscribe } from '../src/injection'


test('action() with number input', t => {
  t.plan(4)

  const store = createStore({
    key: 'value'
  })
  const action = createAction(store)

  store.set('key', 'vaule')

  action('number input', function(arg1, arg2, key) {
    t.is(arg1, 'arg1')
    t.is(arg2, 'arg2')
    t.is(key, 'vaule')
  }, [2, 'key'])

  t.throws(() => {
    action('number input')
  }, Error)

  store.get('number input')()('arg1', 'arg2')
})

test('action() with alternative store', t => {
  t.plan(2)

  const store = createStore({
    key: 'value 1'
  })
  const action = createAction(store)

  /**
   * Test with alternative store
   */

  action('callWithAlternativeStore', function(arg1, key) {
    t.is(arg1, 'arg1')
    t.is(key, 'new value')
  }, [null, 'key'])

  const store2 = createStore({
    key: 'new value'
  })

  store.get('callWithAlternativeStore')(store2)('arg1', 'key')
})

test('action() produces output to store', t => {
  t.plan(2)

  const store = createStore({
    key: 'value 2'
  })
  const action = createAction(store)

  action('with output')
    .pipe(function() {
      return {
        newKey: 'new key'
      }
    }, null, 'newKey')
    .output('newKey')

  store.get('with output')()()
  t.is(store.get('newKey'), 'new key')

  // Output to other store
  const store2 = createStore()
  store.get('with output')(store2)()
  t.is(store2.get('newKey'), 'new key')
})

test('get action from provide and subscribe', t => {
  t.plan(11)

  const store = createStore({
    title: 'value 3',
    content: undefined
  })
  const App = getApp(store)
  const action = createAction(store)
  const provide = createProvide(store)
  const subscribe = createSubscribe(store)

  let counter = 1
  action('getAndChangeTitle')
    .input('theTitle')
    .pipe(function(theTitle, title, content) {
      if (1 === counter)
        t.is(title, 'value 3')
      else if (2 === counter)
        t.is(title, 'value 31')

      t.is(theTitle, title)
      return {
        title: 'value 3' + counter++
      }
    }, ['theTitle', 'title', 'content'], ['title'])
    .pipe('output', 'title')

  /**
   * Test provide.
   */

  const fn1 = provide(function(props) {
    props.getAndChangeTitle(props.title)
    t.is(props.content, undefined)
  }, ['getAndChangeTitle', 'title', 'content'])

  t.is(store.get('title'), 'value 3')
  fn1()
  t.is(store.get('title'), 'value 31')

  /**
   * Test subscribe.
   */

  class ReactComponent extends React.Component {
    constructor(props) {
      super(props)
      t.is(props.title, 'value 31')
      t.is(store.get('title'), 'value 31')
    }

    componentWillMount() {
      this.props.getAndChangeTitle(this.props.title)
    }

    render() {
      return <p>
               { this.props.title }
             </p>
    }
  }

  const SubscribedFnComponent = subscribe(ReactComponent, ['getAndChangeTitle', 'title'])
  const tree1 = render.create(<App component={ SubscribedFnComponent } />).toJSON()
  t.snapshot(tree1)

  t.is(store.get('title'), 'value 32')
})
