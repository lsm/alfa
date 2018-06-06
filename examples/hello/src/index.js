// index.js
import React from 'react'
import { render } from 'react-dom'
import { provide } from 'alfa'
import ChangeName from './change.js'
import HelloMessage from './hello.js'

// Define the root app which renders HelloMessage as child.
const App = () => (
  <div>
    <HelloMessage />
    <ChangeName />
  </div>
)

// Bind App with alfa using `provide(Component, data)` with initial data.
const Root = provide(App, {
  name: 'Motoko'
})

render(<Root />, document.getElementById('root'))
