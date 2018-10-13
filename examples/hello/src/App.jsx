import React from 'react'
import { render } from 'react-dom'
import HelloMessage from './HelloMessage.jsx'
import ChangeName from './ChangeName.jsx'
import { Provider } from 'alfa'

const App = function() {
  return (
    <Provider data={{ name: 'Motoko' }}>
      <div>
        <HelloMessage />
        <ChangeName />
      </div>
    </Provider>
  )
}

render(<App />, document.getElementById('root'))

// Or, we can use the function `provide` instead of the declarative style above:
//
// // Define the root app which renders HelloMessage & ChangeName as child.
// const App = () => (
//   <div>
//     <HelloMessage />
//     <ChangeName />
//   </div>
// )

// // Bind App with alfa using `provide(Component, data)` with initial data.
// const Root = provide(App, {
//   name: 'Motoko'
// })
//
// render(<Root />, document.getElementById('root'))
