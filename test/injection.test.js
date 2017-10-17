import test from 'tape'
import React, { Component } from 'react'
import Adapter from 'enzyme-adapter-react-16'
import PropTypes from 'prop-types'
import { app, createStore } from '../src'
import { mount, configure } from 'enzyme'
import { createProvide, createSubscribe } from '../src/injection'


configure({
  adapter: new Adapter()
})


test('injection.createProvide()', t => {
  t.plan(6)

  const store = createStore()
  store.set('title', 'value')
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
  const App1 = app(ProvidedFnComponent, store)

  // const tree1 = render.create(<App1/>).toJSON()
  // t.snapshot(tree1)

  const wrapper1 = mount(<App1/>)
  t.is(wrapper1.contains(<h2>value</h2>), true)

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
  const App2 = app(ProvidedReactComponent, store)

  // const tree2 = render.create(<App2 />).toJSON()
  // t.snapshot(tree2)

  const wrapper2 = mount(<App2/>)
  t.is(wrapper2.contains(<h1>value</h1>), true)


  t.throws(() => {
    provide(ReactComponent, 123)
  }, TypeError)
})


test('injection.createSubscribe()', t => {
  t.plan(11)

  const store = createStore()
  store.set('title', 'Old Title')
  const subscribe = createSubscribe(store)

  // 1
  t.is(typeof subscribe, 'function')

  /**
   * Test invalidate input
   */

  t.throws(() => {
    // 2
    subscribe(3)
  }, TypeError)

  t.throws(() => {
    // 3
    subscribe(null)
  }, TypeError)

  /**
   * Test function component
   */

  function FnComponent(props) {
    // This will be called twice.
    // 4,5
    t.is(props.title, store.get('title'))
    return <h1>{ props.title }</h1>
  }

  const SubscribedFnComponent = subscribe(FnComponent, 'title')
  const App1 = app(SubscribedFnComponent, store)

  const wrapper1 = mount(<App1/>)
  // 6
  t.is(wrapper1.contains(<h1>Old Title</h1>), true)

  /**
   * Test React component
   */

  class ReactComponent extends Component {
    static propTypes = {
      title: PropTypes.string.isRequired
    }

    render() {
      // This will be called 3 times.
      // 7,8,9
      t.is(this.props.title, store.get('title'))
      return <h3>{ this.props.title }</h3>
    }
  }

  const SubscribedReactComponent = subscribe(ReactComponent, ['title'])
  const App2 = app(SubscribedReactComponent, store)

  const wrapper2 = mount(<App2/>)
  // 10
  t.is(wrapper2.contains(<h3>Old Title</h3>), true, 'Old title matches')

  store.set('title', 'New Title')

  const wrapper3 = mount(<App2/>)
  // 11
  t.ok(wrapper3.contains(<h3>New Title</h3>), 'New title matches')
})


test('provide and use set', t => {
  t.plan(3)

  const store = createStore({
    title: 'value'
  })
  const provide = createProvide(store)

  function FnComponent(props) {
    t.is(props.title, 'value')
    props.set('title', 'new title')
    return <h4>{ props.title }</h4>
  }

  const ProvidedFnComponent = provide(FnComponent, ['set', 'title'], ['title'])
  const App = app(ProvidedFnComponent, store)

  const wrapper = mount(<App/>)
  t.ok(wrapper.contains(<h4>value</h4>), 'Title matches')

  t.is(store.get('title'), 'new title')
})


test('provide with dynamic injection', t => {
  t.plan(4)

  const store = createStore({
    title: 'The title',
    subTitle: 'The sub title'
  })
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
  const App = app(ProvidedReactComponent, store)

  const wrapper = mount(<App/>)
  t.is(wrapper.contains(<div>
                          <h1>The title</h1>
                          <h3>The sub title</h3>
                        </div>), true)
})


test('subscribe with dynamic injection', t => {
  t.plan(10)

  const store = createStore({
    title: 'The title',
    'The title key': 'The sub title'
  })
  const subscribe = createSubscribe(store)

  class ReactComponent extends Component {
    static propTypes = {
      title: PropTypes.string.isRequired,
      subTitle: PropTypes.string.isRequired
    }

    static keys = function(props) {
      t.is(props.title, 'The title', 'static keys, props.title')
      return {
        'subTitle': props.title + ' key'
      }
    }

    render() {
      t.is(this.props.title, store.get('title'), 'props.title')
      t.is(this.props.subTitle, store.get('The title key'), 'props.subTitle')
      return (<div>
                <h2>{ this.props.title }</h2>
                <h5>{ this.props.subTitle }</h5>
              </div>)
    }
  }

  const SubscribedReactComponent = subscribe(ReactComponent, ['title'])
  const App = app(SubscribedReactComponent, store)

  const wrapper1 = mount(<App/>)
  t.ok(wrapper1.contains(<div>
                           <h2>The title</h2>
                           <h5>The sub title</h5>
                         </div>), 'render result 1')

  store.set('The title key', 'New sub title')

  const wrapper2 = mount(<App/>)
  t.ok(wrapper2.contains(<div>
                           <h2>The title</h2>
                           <h5>New sub title</h5>
                         </div>), 'render result 2')

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
  t.doesNotThrow(() => {
    SubscribedFnComponent = subscribe(FnComponent)
    t.pass()
  })

  var ProvidedFnComponent
  t.doesNotThrow(() => {
    ProvidedFnComponent = provide(SubscribedFnComponent)
    t.pass()
  })

  t.doesNotThrow(() => {
    subscribe(ProvidedFnComponent)
    t.pass()
  })

  class ReactComponent extends Component {

  }

  t.throws(() => {
    provide(ReactComponent)
  })

  t.throws(() => {
    subscribe(ReactComponent)
  })

  function NoKeysComponent() {
  }

  t.throws(() => {
    provide(NoKeysComponent)
  })

  t.throws(() => {
    subscribe(NoKeysComponent)
  })
})


test('provide or subscribe set without output keys should throw', t => {
  t.plan(2)
  const store = createStore()
  const provide = createProvide(store)
  const subscribe = createSubscribe(store)

  function FnComponent() {
  }

  t.throws(() => {
    provide(FnComponent, ['set'])
  }, 'provide "set" without output key')

  t.throws(() => {
    subscribe(FnComponent, ['set'])
  }, 'subscribe "set" without output key')
})


// The falling test will fail in some env until 
// https://github.com/facebook/react/issues/11098 
// gets resolved.
// test('Call set without predefined output should throw', t => {
//   t.plan(4)
//   const store = createStore()
//   const subscribe = createSubscribe(store)

//   class ReactComponent extends Component {
//     componentWillMount() {
//       this.props.set('predefinedOutput', 'the value')
//       this.props.set('invaildOutput', 'the value which does not matter')
//     }

//     render() {
//       return <div></div>
//     }
//   }

//   const SubscribedReactComponent = subscribe(ReactComponent, ['set'], ['predefinedOutput'])
//   const App = app(SubscribedReactComponent, store)

//   t.throws(() => {
//     mount(<App />)
//   }, 'Output key "invaildOutput" is not allowed')
//   t.is(store.get('predefinedOutput'), 'the value')

//   class NewComponent extends Component {
//     componentWillMount() {
//       this.props.set({
//         'predefinedOutput': 'new value',
//         'someInvaildOutput': 'the value which does not matter'
//       })
//     }

//     render() {
//       return <div></div>
//     }
//   }

//   const SubscribedNewComponent = subscribe(NewComponent, ['set'], ['predefinedOutput'])
//   const NewApp = app(SubscribedNewComponent, store)

//   t.throws(() => {
//     mount(<NewApp />)
//   }, 'Output key "someInvaildOutput" is not allowed')
//   t.is(store.get('predefinedOutput'), 'new value')
// })


test('Should set dynamic key correctly', t => {
  t.plan(2)
  const store = createStore()
  const provide = createProvide(store)

  class ReactComponent extends Component {
    static keys(props) {
      return {
        theDynamicKey: props.target,
        anotherDynamicKey: props.anotherTarget
      }
    }

    componentWillMount() {
      this.props.set('theDynamicKey', 'the value which does matter')
      this.props.set({
        anotherDynamicKey: 'another value does matter'
      })
    }

    render() {
      return <div></div>
    }
  }

  const ProvidedReactComponent = provide(ReactComponent, ['set'], ['theDynamicKey'])
  const App = app(ProvidedReactComponent, store)

  mount(<App target='theTargetKey'
             anotherTarget="anotherTargetKey" />)

  t.is(store.get('theTargetKey'), 'the value which does matter')
  t.is(store.get('anotherTargetKey'), 'another value does matter')
})
