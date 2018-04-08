// hello.js
import React from 'react'
import { subscribe } from 'alfa'

class HelloMessage extends React.Component {
  render() {
    const message = `Hello ${this.props.name}!`
    return <div>{message}</div>
  }
}

export default subscribe(HelloMessage, ['name'])
