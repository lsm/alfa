// hello.js
import React from 'react'
import { subscribe } from 'alfa'

// A stateless functional component.
function HelloMessage(props) {
  // Data is injected as the property of props.
  return <div>Hello ${props.name}!</div>
}

export default subscribe(HelloMessage, ['name'])
