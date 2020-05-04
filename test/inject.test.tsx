import test from 'tape'
import React, { Component } from 'react'
import Adapter from 'enzyme-adapter-react-16'
import PropTypes from 'prop-types'

import { provide, inject } from '../src'
import { mount, configure } from 'enzyme'
import { StoreSetFunction } from '../src/types'

configure({ adapter: new Adapter() })

test('incorrect inject inputs', t => {
  t.plan(6)

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
    inject(function() { return true }, 'abc')
  }, TypeError)

  t.throws(() => {
    inject(function() { return true }, [ 'abc' ], 'xyz')
  }, TypeError)

  t.throws(() => {
    inject(function() { return true }, 123)
  }, TypeError)

  t.throws(() => {
    inject(function() { return false }, [ 'title' ], 123)
  }, TypeError)
})

test('inject react component', t => {
  type Props = {
    title: string;
  }
  const title = 'The value of title'
  const data = { title }

  t.test('inject function component', t => {
    t.plan(1)

    function FnComponent(props: Props): JSX.Element {
      return <h2>{props.title}</h2>
    }
    const FnComponentInjected = inject(FnComponent, [ 'title' ])
    const App = provide(FnComponentInjected, data)
    const wrapper = mount(<App />)

    t.is(wrapper.contains(<h2>{title}</h2>), true)
  })

  t.test('inject class component', t => {
    t.plan(1)

    class ReactComponent extends Component<Props> {
      static propTypes = { title: PropTypes.string.isRequired }

      render(): React.ReactNode {
        return <h1>{this.props.title}</h1>
      }
    }
    const ReactComponentInjected = inject(ReactComponent, [ 'title' ])
    const App = provide(ReactComponentInjected, data)
    const wrapper = mount(<App />)

    t.is(wrapper.contains(<h1>{title}</h1>), true)
  })

  t.test('inject and use set', t => {
    t.plan(3)

    const newTitle = 'The new title'

    type FnProps = Props & {
      set: StoreSetFunction<FnProps, 'title'>;
    }

    function FnComponent(props: FnProps): JSX.Element {
      t.is(props.title, title, 'Initial title value matched.')
      return <div>
        <h4>{props.title}</h4>
        <button onClick={(): void => props.set('title', newTitle)}></button>
      </div>
    }

    const FnComponentInjected = inject(FnComponent, [ 'set', 'title' ], [ 'title' ])
    const App = provide(FnComponentInjected, data)

    const wrapper = mount(<App />)
    t.ok(wrapper.contains(<h4>{title}</h4>), 'Renderred title matched.')

    // Injected component should not be rerenderred when injected value changed.
    wrapper.find('button').simulate('click')
    t.notOk(wrapper.contains(<h4>{newTitle}</h4>), 'Updated title matched.')

    wrapper.unmount()
  })
})

test('inject or subscribe set without output keys should throw', t => {
  t.plan(1)

  const FnComponent: React.FC = function (): JSX.Element {
    return <p/>
  }

  t.throws(() => {
    inject(FnComponent, [ 'set' ])
  }, 'inject "set" without output key')
})

test('Call set without predefined output should throw', t => {
  t.plan(3)

  type OutputProps = {
    predefinedOutput: string;
  }
  type Props = {
    set: StoreSetFunction<OutputProps>;
  }

  class ReactComponent extends Component<Props> {
    componentDidMount(): void {
      this.props.set('predefinedOutput', 'the value')
      this.props.set({ predefinedOutput: 'the value' })

      t.throws(() => {
        this.props.set('invaildOutput', 'the value which does not matter')
      }, 'Output key "invaildOutput" is not allowed')
      t.throws(() => {
        this.props.set({ anotherInvaildOutput: 'the value which does not matter' })
      }, 'Output key "anotherInvaildOutput" is not allowed')
      t.throws(() => {
        this.props.set({
          predefinedOutput: 'new value',
          someInvaildOutput: 'the value which does not matter',
        })
      }, 'Output key "someInvaildOutput" is not allowed')
    }

    render(): React.ReactNode {
      return <div></div>
    }
  }

  const InjectedReactComponent = inject<Props, OutputProps>(
    ReactComponent,
    [ 'set' ],
    [ 'predefinedOutput' ],
  )
  const App = provide(InjectedReactComponent, {})
  const wrapper = mount(<App />)

  wrapper.unmount()
})
