import test from 'tape'
import React from 'react'
import Adapter from 'enzyme-adapter-react-16'
import createAction from '../src/action'
import { app, action, createStore } from '../src'
import { mount, configure } from 'enzyme'
import { createProvide, createSubscribe } from '../src/injection'


configure({
  adapter: new Adapter()
})


test('action(fn, [2, "key"]) with number input', t => {
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

test('action(fn, null, output) with null input', t => {
  t.plan(2)

  const store = createStore({
    key: 'value'
  })
  const action = createAction(store)

  action('number input', function(arg1, arg2) {
    t.is(arg1, 'arg1')
    t.is(arg2, 'arg2')
  }, null)

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
  const App = app(SubscribedFnComponent, store)
  const wrapper = mount(<App/>)
  // The rendered title at this point should be `value 31` since subscribe only
  // bind changes to `setState` after `componentDidMount`
  t.is(wrapper.contains(<p>
                          value 31
                        </p>), true)
  t.is(store.get('title'), 'value 32')
})

test('action in action', t => {
  t.plan(5)

  const store = createStore({
    title: 'Action in Action',
    content: 'Test action in action'
  })
  const action = createAction(store)
  const provide = createProvide(store)

  action('changeTitle', (title) => {
    t.is(title, 'Action in Action')
    return {
      title: 'Actions in Actions'
    }
  }, 'title', 'title')


  action('change')
    .pipe('changeTitle')
    .pipe((content, next) => {
      t.is(content, 'Test action in action')
      setTimeout(function() {
        next(null, {
          content: 'Test actions in actions'
        })
      }, 50)
    }, ['content', 'next'], ['content'])
    .output(['title', 'content'])
    .pipe(function() {
      const wrapper2 = mount(<App/>)
      t.is(wrapper2.contains(<p>
                               Test actions in actions
                             </p>), true)
    })
    .pipe(t.end)


  function FnComponent(props) {
    return (<div>
              <h1>{ props.title }</h1>
              <p>
                { props.content }
              </p>
            </div>)
  }

  const ProvidedFnComponent = provide(FnComponent, ['title', 'content'])
  const App = app(ProvidedFnComponent, store)

  const wrapper = mount(<App/>)
  t.is(wrapper.contains(<p>
                          Test action in action
                        </p>), true)

  store.get('change')(store)()

  // The `change` action is async so this should be still the old value.
  t.is(store.get('content'), 'Test action in action')
})

test('action in action with input output', t => {
  t.plan(6)

  const title = 'Action in Action with Input Output'
  const content = 'Test action in action with input & output'
  const contentToChange = 'Test actions in actions with input & output'

  const store = createStore({
    title: title,
    content: content
  })

  const action = createAction(store)
  const provide = createProvide(store)

  action('changeTitle')
    .pipe('input', 'newTitle')
    .pipe((oldTitle, newTitle) => {
      t.is(oldTitle, title)
      return {
        title: newTitle
      }
    }, 'title', 'title')
    .pipe('output', 'title')

  action('changeContentAndTitle')
    .input('newConent')
    .pipe('changeTitle')
    .pipe((oldContent, newConent, next) => {
      t.is(oldContent, content)
      setTimeout(function() {
        next(null, {
          content: newConent
        })
      }, 50)
    }, ['content', 'newConent', 'next'], ['content'])
    .output(['title', 'content'])
    .pipe(function() {
      const wrapper2 = mount(<App/>)
      t.is(wrapper2.contains(<p>
                               { contentToChange }
                             </p>), true)
    })
    .pipe(function(newConent) {
      t.is(newConent, contentToChange)
      t.end()
    })

  function FnComponent(props) {
    return (<div>
              <h1>{ props.title }</h1>
              <p>
                { props.content }
              </p>
            </div>)
  }

  const ProvidedFnComponent = provide(FnComponent, ['title', 'content'])
  const App = app(ProvidedFnComponent, store)

  const wrapper = mount(<App/>)
  t.is(wrapper.contains(<p>
                          { content }
                        </p>), true)

  store.get('changeContentAndTitle')(store)(contentToChange)

  // The `change` action is async so this should be still the old value.
  t.is(store.get('content'), content)
})

test('action in action with global action', t => {
  t.plan(5)

  const store = createStore({
    title: 'Action in Action',
    content: 'Test action in action'
  })
  // const action = createAction(store)
  const provide = createProvide(store)

  action('changeTitle', (title) => {
    t.is(title, 'Action in Action')
    return {
      title: 'Actions in Actions'
    }
  }, 'title', 'title')


  const change = action('change')
    .pipe('changeTitle')
    .pipe((content, next) => {
      t.is(content, 'Test action in action')
      setTimeout(function() {
        next(null, {
          content: 'Test actions in actions'
        })
      }, 50)
    }, ['content', 'next'], ['content'])
    .output(['title', 'content'])
    .pipe(function() {
      const wrapper2 = mount(<App/>)
      t.is(wrapper2.contains(<p>
                               Test actions in actions
                             </p>), true)
    })
    .pipe(t.end)


  function FnComponent(props) {
    return (<div>
              <h1>{ props.title }</h1>
              <p>
                { props.content }
              </p>
            </div>)
  }

  const ProvidedFnComponent = provide(FnComponent, ['title', 'content'])
  const App = app(ProvidedFnComponent, store)

  const wrapper = mount(<App/>)
  t.is(wrapper.contains(<p>
                          Test action in action
                        </p>), true)

  change(store)()

  // The `change` action is async so this should be still the old value.
  t.is(store.get('content'), 'Test action in action')
})
