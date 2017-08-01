// index.js
import React from 'react'
import { app } from 'alfa'
import { render } from 'react-dom'
import ChangeName from './change.js'
import HelloMessage from './hello.js'


// Define the root app which renders HelloMessage as child.
const App = () => (
  <div>
    <HelloMessage/>
    <ChangeName/>
  </div>
)

// Bind App with alfa using `app(Component, data)` with initial data.
const Root = app(App, {
  name: 'Motoko'
})

render(<Root />, document.getElementById('root'))
