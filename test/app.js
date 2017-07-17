import PropTypes from 'prop-types'
import React, { Component } from 'react'


export default function getApp(store) {
  return class App extends Component {
    static propTypes = {
      component: PropTypes.func.isRequired
    }

    static childContextTypes = {
      alfaStore: PropTypes.object,
    }

    getChildContext() {
      return {
        alfaStore: store
      }
    }

    render() {
      const Component = this.props.component
      return <div>
               <Component/>
             </div>
    }
  }
}
