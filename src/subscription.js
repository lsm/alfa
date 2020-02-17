import { Component, createElement } from 'react'
import PropTypes from 'prop-types'
import { normalize } from './common'
import { getInjectedProps, getDynamicInputs, getDynamicProps } from './input'

class Subscription extends Component {
  static contextTypes = {
    alfaStore: PropTypes.object
  }

  constructor(props, context, updater) {
    // Call the original constructor.
    super(props, context, updater)

    /* istanbul ignore next */
    // Save the store for subscribe/unsubscribe.
    this.store = context && context.alfaStore
    // Use bound setState as subscription function.
    this.setState = this.setState.bind(this)
  }

  getProps = (props, alfaStore, inputs, outputs, keys) => {
    if (!alfaStore) {
      return props
    }
    // Get injected props which is part of the state of the component.
    const injectedProps = getInjectedProps(inputs, outputs, alfaStore)
    // Merge injected props with props where the injectedProps has higher priority.
    var _props = { ...props, ...injectedProps }

    // Get dynamic inputs.
    const dynamicInputs = getDynamicInputs(keys, _props, inputs)
    this.maps = dynamicInputs.maps
    this.inputs = dynamicInputs.inputs
    // Get the props and return as state
    return {...props, ...getDynamicProps(dynamicInputs, outputs, alfaStore)}
  }

  componentDidMount() {
    // Call `setState` when subscribed keys changed.
    this.store && this.store.subscribe(this.inputs, this.setState, this.maps)
  }

  componentWillUnmount() {
    // Unsubcribe `setState` when component is about to unmount.
    this.store && this.store.unsubscribe(this.setState)
  }
}

export function subscribe(WrappedComponent, inputs, outputs) {
  const [_inputs, _outputs, keys] = normalize(WrappedComponent, inputs, outputs)

  return class AlfaSubscribedComponent extends Subscription {
    static keys = keys

    render() {
      // Render the original component with generated state as its props.
      const props = this.getProps(this.props, this.store, _inputs, _outputs, keys)
      return createElement(WrappedComponent, props)
    }
  }
}