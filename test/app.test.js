import test from 'tape'
import Adapter from 'enzyme-adapter-react-16'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { app, App, inject, subscribe } from '../src'
import { mount, configure } from 'enzyme'

configure({
  adapter: new Adapter()
})

test('app(Component, data): with initial data', t => {
  t.plan(1)
  function FnComponent(props) {
    return <h1>{props.title}</h1>
  }

  const InjectedFnComponent = inject(FnComponent, ['title'])

  const App = app(InjectedFnComponent, {
    title: 'App test initial data'
  })

  const wrapper = mount(<App />)
  t.is(wrapper.contains(<h1>App test initial data</h1>), true)
})

test('app(Component): with internal store', t => {
  t.plan(1)
  class ReactComponent extends Component {
    static propTypes = {
      set: PropTypes.func.isRequired,
      title: PropTypes.string
    }

    handleClick = () => {
      this.props.set('title', 'App test internal store')
    }

    render() {
      return <h1 onClick={this.handleClick}>{this.props.title}</h1>
    }
  }

  const SubscribedReactComponent = subscribe(
    ReactComponent,
    ['set', 'title'],
    ['title']
  )

  const App = app(SubscribedReactComponent)
  const wrapper = mount(<App />)
  wrapper.find('h1').simulate('click')
  t.is(wrapper.text(), 'App test internal store', 'Title rendered correctly')
})

test('Use the class interface <App />', t => {
  t.plan(1)
  function FnComponent(props) {
    return <h1>{props.title}</h1>
  }

  const data = {
    title: 'App test initial data'
  }
  const InjectedFnComponent = inject(FnComponent, ['title'])

  const wrapper = mount(
    <App data={data}>
      <InjectedFnComponent />
    </App>
  )
  t.is(wrapper.contains(<h1>App test initial data</h1>), true)
})
