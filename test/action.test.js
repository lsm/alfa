import tape from 'tape'
import Adapter from 'enzyme-adapter-react-16'
import React, { Component } from 'react'
import { mount, configure } from 'enzyme'
import { app, Store, action, inject, subscribe } from '../src'

configure({
  adapter: new Adapter()
})

function createStore(data) {
  return new Store(data)
}

tape('action(func, inputs, outputs)', test => {
  test.plan(8)

  const getAndChangeTitle = action(
    function({ title }) {
      test.is(title, 'value of title')
      return {
        title: 'new value of title'
      }
    },
    'title',
    'title'
  )

  const data = {
    title: 'value of title',
    content: 'value of content',
    getAndChangeTitle,
    actionDoesNothing: action(function() {}, 'title')
  }
  const store1 = createStore(data)

  /**
   * Test inject.
   */

  const ComponentOne = inject(
    function(props) {
      props.getAndChangeTitle({ title: props.title })
      props.actionDoesNothing()
      test.is(props.content, 'value of content', 'ComponentOne content matches')
      return <h1>{props.title}</h1>
    },
    ['title', 'content', 'getAndChangeTitle', 'actionDoesNothing']
  )

  const App1 = app(ComponentOne, store1)

  test.is(store1.get('title'), 'value of title')
  const wrapper1 = mount(<App1 />)
  test.is(wrapper1.contains('value of title'), true)
  test.is(store1.get('title'), 'new value of title')

  /**
   * Test subscribe
   */

  class ComponentTwo extends Component {
    onButtonClick = () => {
      this.props.getAndChangeTitle({ title: this.props.title })
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

  const SubscribedCom = subscribe(ComponentTwo, ['title', 'getAndChangeTitle'])

  const store2 = createStore(data)
  const App2 = app(SubscribedCom, store2)
  const wrapper2 = mount(<App2 />)
  test.is(wrapper2.contains(<h1>value of title</h1>), true)
  wrapper2.find('button').simulate('click')
  test.is(wrapper2.contains(<h1>new value of title</h1>), true)
})
