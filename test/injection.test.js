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
    return <h4>{ props.title }</h4>
  }

  const ProvidedFnComponent = provide(FnComponent, ['set', 'title'])
  const component = render.create(<App component={ ProvidedFnComponent } />)
  const tree = component.toJSON()
  t.snapshot(tree)

  t.is(store.get('title'), 'new title')
})

test('provide with dynamic injection', t => {
  t.plan(4)

  const store = createStore({
    title: 'The title',
    subTitle: 'The sub title'
  })

  const App = getApp(store)
  const provide = createProvide(store)

  class ReactComponent extends Component {
    static propTypes = {
      title: PropTypes.string.isRequired,
      subTitle: PropTypes.string.isRequired
    }

    static keys = function(props) {
      t.is(props.title, 'The title')
      return ['subTitle']
    }

    render() {
      t.is(this.props.title, store.get('title'))
      t.is(this.props.subTitle, store.get('subTitle'))
      return (<div>
                <h1>{ this.props.title }</h1>
                <h3>{ this.props.subTitle }</h3>
              </div>)
    }
  }

  const ProvidedReactComponent = provide(ReactComponent, ['title'])
  const tree = render.create(<App component={ ProvidedReactComponent } />).toJSON()
  t.snapshot(tree)
})


test('subscribe with dynamic injection', t => {
  t.plan(7)

  const store = createStore({
    title: 'The title',
    'The title key': 'The sub title'
  })

  const App = getApp(store)
  const subscribe = createSubscribe(store)

  class ReactComponent extends Component {
    static propTypes = {
      title: PropTypes.string.isRequired,
      subTitle: PropTypes.string.isRequired
    }

    static keys = function(props) {
      t.is(props.title, 'The title')
      return {
        'subTitle': props.title + ' key'
      }
    }

    render() {
      t.is(this.props.title, store.get('title'))
      t.is(this.props.subTitle, store.get('The title key'))
      return (<div>
                <h2>{ this.props.title }</h2>
                <h5>{ this.props.subTitle }</h5>
              </div>)
    }
  }

  const SubscribedReactComponent = subscribe(ReactComponent, ['title'])
  const component = render.create(<App component={ SubscribedReactComponent } />)
  t.snapshot(component.toJSON())

  store.set('The title key', 'New sub title')

  t.snapshot(component.toJSON())
})


test('subscribe/provide with only `keys`', t => {
  t.plan(10)

  const store = createStore()

  const provide = createProvide(store)
  const subscribe = createSubscribe(store)

  function FnComponent() {
  }

  FnComponent.keys = function(props) {
    return {
      theKey: props.theValueOfKey
    }
  }

  var SubscribedFnComponent
  t.notThrows(() => {
    SubscribedFnComponent = subscribe(FnComponent)
    t.pass()
  })

  var ProvidedFnComponent
  t.notThrows(() => {
    ProvidedFnComponent = provide(SubscribedFnComponent)
    t.pass()
  })

  t.notThrows(() => {
    subscribe(ProvidedFnComponent)
    t.pass()
  })

  class ReactComponent extends Component {

  }

  t.throws(() => {
    provide(ReactComponent)
  }, TypeError)

  t.throws(() => {
    subscribe(ReactComponent)
  }, TypeError)

  function NoKeysComponent() {
  }

  t.throws(() => {
    provide(NoKeysComponent)
  }, TypeError)

  t.throws(() => {
    subscribe(NoKeysComponent)
  }, TypeError)
})
