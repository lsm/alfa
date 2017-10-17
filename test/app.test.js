import test from 'tape'
import Adapter from 'enzyme-adapter-react-16'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { app, provide } from '../src'
import { mount, configure } from 'enzyme'


configure({
  adapter: new Adapter()
})


test('app(Component, data): with initial data', t => {
  t.plan(1)
  function FnComponent(props) {
    return <h1>{ props.title }</h1>
  }

  const ProvidedFnComponent = provide(FnComponent, ['title'])

  const App = app(ProvidedFnComponent, {
    title: 'App test initial data'
  })

  const wrapper = mount(<App/>)
  t.is(wrapper.contains(<h1>App test initial data</h1>), true)
})


test('app(Component): with internal store', t => {
  t.plan(1)
  class ReactComponent extends Component {
    static propTypes = {
      set: PropTypes.func.isRequired,
      title: PropTypes.string
    }

    render() {
      if (!this.props.title)
        this.props.set('title', 'App test internal store')
      return <h1>{ this.props.title }</h1>
    }
  }

  const ProvidedReactComponent = provide(ReactComponent, ['set', 'title'], ['title'])
  const App = app(ProvidedReactComponent)

  mount(<App/>)
  const wrapper = mount(<App/>)
  t.is(wrapper.contains(<h1>App test internal store</h1>), true)
})
