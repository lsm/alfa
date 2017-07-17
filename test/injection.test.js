import test from 'ava'
import render from 'react-test-renderer'
import getApp from './app'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { createStore } from '../src'
import { createProvide, createSubscribe } from '../src/injection'


test('injection.createProvide()', t => {
  const store = createStore()
  store.set('title', 'value')
  const App = getApp(store)
  const provide = createProvide(store)

  t.is(typeof provide, 'function')

  /**
   * Test invalidate input
   */

  t.throws(() => {
    provide({})
  }, TypeError)

  t.throws(() => {
    provide(123)
  }, TypeError)

  /**
   * Test function component
   */

  function FnComponent(props) {
    return <h2>{ props.title }</h2>
  }

  const ProvidedFnComponent = provide(FnComponent, 'title')
  const tree1 = render.create(<App component={ ProvidedFnComponent } />).toJSON()
  t.snapshot(tree1)

  /**
   * Test React component
   */

  class ReactComponent extends Component {
    static propTypes = {
      title: PropTypes.string.isRequired
    }

    render() {
      return <h1>{ this.props.title }</h1>
    }
  }

  const ProvidedReactComponent = provide(ReactComponent, ['title'])
  const tree2 = render.create(<App component={ ProvidedReactComponent } />).toJSON()
  t.snapshot(tree2)


  t.throws(() => {
    provide(ReactComponent, 123)
  }, TypeError)
})

test('injection.createSubscribe()', t => {
  t.plan(9)

  const store = createStore()
  store.set('title', 'Old Title')
  const App = getApp(store)
  const subscribe = createSubscribe(store)

  t.is(typeof subscribe, 'function')

  /**
   * Test invalidate input
   */

  t.throws(() => {
    subscribe(3)
  }, TypeError)

  t.throws(() => {
    subscribe(null)
  }, TypeError)

  /**
   * Test function component
   */

  function FnComponent(props) {
    // This will be called twice.
    t.is(props.title, store.get('title'))
    return <h1>{ props.title }</h1>
  }

  const SubscribedFnComponent = subscribe(FnComponent, 'title')
  const tree1 = render.create(<App component={ SubscribedFnComponent } />).toJSON()
  t.snapshot(tree1)

  /**
   * Test React component
   */

  class ReactComponent extends Component {
    static propTypes = {
      title: PropTypes.string.isRequired
    }

    render() {
      // This will be called twice as well.
      t.is(this.props.title, store.get('title'))
      return <h3>{ this.props.title }</h3>
    }
  }

  const SubscribedReactComponent = subscribe(ReactComponent, ['title'])
  const component = render.create(<App component={ SubscribedReactComponent } />)
  const tree2 = component.toJSON()
  t.snapshot(tree2)

  store.set('title', 'New Title')

  component.unmount()
})


test('provide and use set', t => {
  t.plan(3)

  const store = createStore({
    title: 'value'
  })
  const App = getApp(store)
  const provide = createProvide(store)

  function FnComponent(props) {
    t.is(props.title, 'value')
    props.set('title', 'new title')
    return <h4>{props.title}</h4>
  }

  const ProvidedFnComponent = provide(FnComponent, ['set', 'title'])
  const component = render.create(<App component={ ProvidedFnComponent } />)
  const tree = component.toJSON()
  t.snapshot(tree)

  t.is(store.get('title'), 'new title')
})
