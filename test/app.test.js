import test from 'ava'
import render from 'react-test-renderer'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { app, provide } from '../src'


test('app(Component, dat): with initial data', t => {
  function FnComponent(props) {
    return <h1>{ props.title }</h1>
  }

  const ProvidedFnComponent = provide(FnComponent, ['title'])

  const App = app(ProvidedFnComponent, {
    title: 'App test initial data'
  })

  const tree = render.create(<App />).toJSON()
  t.snapshot(tree)
})

test('app(Component): with internal store', t => {
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

  const tree1 = render.create(<App />).toJSON()
  t.snapshot(tree1)

  const tree2 = render.create(<App />).toJSON()
  t.snapshot(tree2)
})
