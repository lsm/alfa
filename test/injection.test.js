import test from 'tape'
import React, { Component } from 'react'
import Adapter from 'enzyme-adapter-react-16'
import PropTypes from 'prop-types'
import { app, Store } from '../src'
import { mount, configure } from 'enzyme'
import { inject, subscribe } from '../src/injection'

configure({
  adapter: new Adapter()
})

function createStore(data) {
  return new Store(data)
}

test('injection.createInjector(store, "inject")', t => {
  t.plan(8)

  const store = createStore()
  store.set('title', 'value')

  t.is(typeof inject, 'function')

  /**
   * Test invalidate input
   */

  t.throws(() => {
    inject({})
  }, TypeError)

  t.throws(() => {
    inject(123)
  }, TypeError)

  t.throws(() => {
    inject(function() {}, 123)
  }, TypeError)

  t.throws(() => {
    inject(function() {}, ['title'], 123)
  }, TypeError)

  /**
   * Test function component
   */

  function FnComponent(props) {
    return <h2>{props.title}</h2>
  }

  const ProvidedFnComponent = inject(FnComponent, 'title')
  const App1 = app(ProvidedFnComponent, store)

  // const tree1 = render.create(<App1/>).toJSON()
  // t.snapshot(tree1)

  const wrapper1 = mount(<App1 />)
  t.is(wrapper1.contains(<h2>value</h2>), true)

  /**
   * Test React component
   */

  class ReactComponent extends Component {
    static propTypes = {
      title: PropTypes.string.isRequired
    }

    render() {
      return <h1>{this.props.title}</h1>
    }
  }

  const ProvidedReactComponent = inject(ReactComponent, ['title'])
  const App2 = app(ProvidedReactComponent, store)

  const wrapper2 = mount(<App2 />)
  t.is(wrapper2.contains(<h1>value</h1>), true)

  t.throws(() => {
    inject(ReactComponent, 123)
  }, TypeError)
})

test('injection.createInjector(store, "subscribe")', t => {
  t.plan(11)

  const store = createStore()
  store.set('title', 'Old Title')

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
    return <h1>{props.title}</h1>
  }

  const SubscribedFnComponent = subscribe(FnComponent, 'title')
  const App1 = app(SubscribedFnComponent, store)

  const wrapper1 = mount(<App1 />)
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
      return <h3>{this.props.title}</h3>
    }
  }

  const SubscribedReactComponent = subscribe(ReactComponent, ['title'])
  const App2 = app(SubscribedReactComponent, store)

  const wrapper2 = mount(<App2 />)
  // 10
  t.is(wrapper2.contains(<h3>Old Title</h3>), true, 'Old title matches')

  store.set('title', 'New Title')

  const wrapper3 = mount(<App2 />)
  // 11
  t.ok(wrapper3.contains(<h3>New Title</h3>), 'New title matches')

  // Unmount all components
  wrapper1.unmount()
  wrapper2.unmount()
  wrapper3.unmount()
})

test('inject and use set', t => {
  t.plan(3)

  const store = createStore({
    title: 'value'
  })

  function FnComponent(props) {
    t.is(props.title, 'value')
    props.set('title', 'new title')
    return <h4>{props.title}</h4>
  }

  const ProvidedFnComponent = inject(FnComponent, ['set', 'title'], ['title'])
  const App = app(ProvidedFnComponent, store)

  const wrapper = mount(<App />)
  t.ok(wrapper.contains(<h4>value</h4>), 'Title matches')

  t.is(store.get('title'), 'new title')

  wrapper.unmount()
})

test('subscribe and use set', t => {
  t.plan(3)

  const store = createStore({
    title: 'value'
  })

  class ReactComponent extends Component {
    onButtonClick = () => {
      this.props.set('title', 'new title')
    }

    render() {
      return (
        <div>
          <h1>{this.props.title}</h1>
          <button onClick={this.onButtonClick} />
        </div>
      )
    }
  }

  const SubscribedComponent = subscribe(
    ReactComponent,
    ['set', 'title'],
    ['title']
  )
  const App = app(SubscribedComponent, store)

  const wrapper = mount(<App />)
  t.ok(wrapper.contains(<h1>value</h1>), 'Title matches')

  // Click button and trigger title change.
  wrapper.find('button').simulate('click')
  t.is(store.get('title'), 'new title')
  t.ok(wrapper.contains(<h1>new title</h1>), 'Title changed')

  wrapper.unmount()
})

test('throw when output key is not defined', t => {
  t.plan(3)

  const store = createStore({
    title: 'value'
  })

  function FnComponent(props) {
    props.set({ title: 'new title' })
    t.throws(() => {
      props.set('keyNotAllowed', 'value')
    }, Error)
    return null
  }

  const SubscribedComponent = subscribe(
    FnComponent,
    ['set', 'title'],
    ['title']
  )

  const App = app(SubscribedComponent, store)
  mount(<App />)

  t.is(store.get('title'), 'new title')
  t.is(store.get('keyNotAllowed'), undefined)
})

test('inject with dynamic keys', t => {
  t.plan(4)

  const store = createStore({
    title: 'The title',
    subTitle: 'The sub title'
  })

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
      return (
        <div>
          <h1>{this.props.title}</h1>
          <h3>{this.props.subTitle}</h3>
        </div>
      )
    }
  }

  const ProvidedReactComponent = inject(ReactComponent, ['title'])
  const App = app(ProvidedReactComponent, store)

  const wrapper = mount(<App />)
  t.is(
    wrapper.contains(
      <div>
        <h1>The title</h1>
        <h3>The sub title</h3>
      </div>
    ),
    true
  )

  wrapper.unmount()
})

test('subscribe with dynamic keys', t => {
  t.plan(10)

  const store = createStore({
    title: 'The title',
    'The title key': 'The sub title'
  })

  class ReactComponent extends Component {
    static propTypes = {
      title: PropTypes.string.isRequired,
      subTitle: PropTypes.string.isRequired
    }

    static keys = function(props) {
      t.is(props.title, 'The title', 'static keys, props.title')
      return {
        otherKey: 'other key which will be never used',
        subTitle: props.title + ' key'
      }
    }

    render() {
      t.is(this.props.title, store.get('title'), 'props.title')
      t.is(this.props.subTitle, store.get('The title key'), 'props.subTitle')
      return (
        <div>
          <h2>{this.props.title}</h2>
          <h5>{this.props.subTitle}</h5>
        </div>
      )
    }
  }

  const SubscribedReactComponent = subscribe(ReactComponent, ['title'])
  const App = app(SubscribedReactComponent, store)

  const wrapper1 = mount(<App />)
  t.ok(
    wrapper1.contains(
      <div>
        <h2>The title</h2>
        <h5>The sub title</h5>
      </div>
    ),
    'render result 1'
  )

  store.set('The title key', 'New sub title')

  const wrapper2 = mount(<App />)
  t.ok(
    wrapper2.contains(
      <div>
        <h2>The title</h2>
        <h5>New sub title</h5>
      </div>
    ),
    'render result 2'
  )
})

test('subscribe/inject with only `keys`', t => {
  t.plan(7)

  function FnComponent() {}

  FnComponent.keys = function(props) {
    return {
      theKey: props.theValueOfKey
    }
  }

  var SubscribedFnComponent
  t.doesNotThrow(() => {
    SubscribedFnComponent = subscribe(FnComponent)
  })

  var ProvidedFnComponent
  t.doesNotThrow(() => {
    ProvidedFnComponent = inject(SubscribedFnComponent)
  })

  t.doesNotThrow(() => {
    subscribe(ProvidedFnComponent)
  })

  class ReactComponent extends Component {}

  t.throws(() => {
    inject(ReactComponent)
  })

  t.throws(() => {
    subscribe(ReactComponent)
  })

  function NoKeysComponent() {}

  t.throws(() => {
    inject(NoKeysComponent)
  })

  t.throws(() => {
    subscribe(NoKeysComponent)
  })
})

test('subscribe/inject with `keys` which returns invalid data', t => {
  t.plan(1)
  const store = createStore()

  class ReactComponent extends Component {
    static keys = function(props) {
      return 1
    }

    render() {
      return null
    }
  }

  t.doesNotThrow(() => {
    const SubscribedComponent = subscribe(ReactComponent, ['abc'])
    const App = app(SubscribedComponent, store)
    const wrapper1 = mount(<App />)
    wrapper1.unmount()
  })
})

test('inject or subscribe set without output keys should throw', t => {
  t.plan(2)

  function FnComponent() {}

  t.throws(() => {
    inject(FnComponent, ['set'])
  }, 'inject "set" without output key')

  t.throws(() => {
    subscribe(FnComponent, ['set'])
  }, 'subscribe "set" without output key')
})

test('Call set without predefined output should throw', t => {
  t.plan(4)
  const store = createStore()

  class ReactComponent extends Component {
    componentDidMount() {
      this.props.set('predefinedOutput', 'the value')

      t.throws(() => {
        this.props.set('invaildOutput', 'the value which does not matter')
      }, 'Output key "invaildOutput" is not allowed')
    }

    render() {
      return <div />
    }
  }

  const SubscribedReactComponent = subscribe(
    ReactComponent,
    ['set'],
    ['predefinedOutput']
  )
  const App = app(SubscribedReactComponent, store)
  const wrapper1 = mount(<App />)
  t.is(store.get('predefinedOutput'), 'the value', 'Value set correctly')

  class NewComponent extends Component {
    componentDidMount() {
      t.throws(() => {
        this.props.set({
          predefinedOutput: 'new value',
          someInvaildOutput: 'the value which does not matter'
        })
      }, 'Output key "someInvaildOutput" is not allowed')
    }

    render() {
      return <div />
    }
  }

  const SubscribedNewComponent = subscribe(
    NewComponent,
    ['set'],
    ['predefinedOutput']
  )
  const NewApp = app(SubscribedNewComponent, store)
  const wrapper2 = mount(<NewApp />)
  t.is(
    store.get('predefinedOutput'),
    'new value',
    'Value set correctly even the function throws'
  )

  wrapper1.unmount()
  wrapper2.unmount()
})

test('Should set dynamic key correctly', t => {
  t.plan(3)
  const store = createStore()

  class ReactComponent extends Component {
    static keys(props) {
      return {
        theDynamicKey: props.target,
        anotherDynamicKey: props.anotherTarget
      }
    }

    componentDidMount() {
      this.props.set('theDynamicKey', 'the value which does matter')
      t.throws(() => {
        this.props.set({
          anotherDynamicKey: 'another value does not matter'
        })
      }, 'Output key "anotherDynamicKey" is not allowed')
    }

    render() {
      return <div />
    }
  }

  const ProvidedReactComponent = inject(
    ReactComponent,
    ['set'],
    ['theDynamicKey']
  )
  const App = app(ProvidedReactComponent, store)

  mount(<App target="theTargetKey" anotherTarget="anotherTargetKey" />)

  t.is(store.get('theTargetKey'), 'the value which does matter')
  t.is(store.get('anotherTargetKey'), undefined)
})

test('Avoid calling subscription functions when the component has been removed in previous subscription function', t => {
  t.plan(3)

  const store = createStore({
    title: 'value'
  })

  class TitleComponent extends Component {
    render() {
      return (
        <div>
          <h1>{this.props.title}</h1>
        </div>
      )
    }
  }

  const SubscribedTitleComponent = subscribe(
    TitleComponent,
    ['set', 'title'],
    ['title']
  )

  class ReactComponent extends Component {
    onButtonClick = () => {
      this.props.set('title', 'new title')
    }

    render() {
      return (
        <div>
          {this.props.title === 'value' && <SubscribedTitleComponent />}
          <button onClick={this.onButtonClick} />
        </div>
      )
    }
  }

  const SubscribedComponent = subscribe(
    ReactComponent,
    ['set', 'title'],
    ['title']
  )

  const App = app(SubscribedComponent, store)

  const wrapper = mount(<App />)
  t.ok(wrapper.contains(<h1>value</h1>), 'Title matches')
  // Click button and trigger title change.
  wrapper.find('button').simulate('click')
  t.is(store.get('title'), 'new title', 'Title changed')
  t.notOk(wrapper.contains(<h1>new title</h1>), 'Title removed')
  wrapper.unmount()
})

test('Subscribed component should use updated props to render', t => {
  t.plan(5)

  const store = createStore({
    title: 'value',
    mainCounter: 0
  })

  class Footer extends Component {
    constructor(props) {
      super(props)
      console.log('footer constructor')
      t.is(props.counter, 0, 'Footer constructor counter matches')
    }

    render() {
      return (
        <p>
          "{this.props.title}" Count {this.props.counter}
        </p>
      )
    }
  }

  const FooterComponent = subscribe(Footer, ['title'])

  class Main extends Component {
    render() {
      return (
        <div>
          <h1>Main Section</h1>
          <FooterComponent counter={this.props.mainCounter} />
        </div>
      )
    }
  }

  const MainComponent = subscribe(Main, ['mainCounter'])

  const App = app(MainComponent, store)

  const wrapper = mount(<App />)
  t.ok(wrapper.contains(<h1>Main Section</h1>), 'Title matches')
  t.ok(wrapper.contains(<p>"value" Count 0</p>), 'Footer matches')

  store.set('mainCounter', 1)
  t.is(
    wrapper.html(),
    '<div><h1>Main Section</h1><p>"value" Count 1</p></div>',
    'Footer matches after counter change'
  )

  store.set('title', 'new title')
  t.is(
    wrapper.html(),
    '<div><h1>Main Section</h1><p>"new title" Count 1</p></div>',
    'Footer matches after title change'
  )
})
