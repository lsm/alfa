import React from 'react'
import { subscribe } from 'alfa'

function HelloMessage(props) {
  return <div>Hello {props.name}</div>
}

export default subscribe(HelloMessage, ['name'])
