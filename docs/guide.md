# Guide

## Add Alfa to Your React Project

Use `npm` to add it to your package.json.

```
npm install --save alfa
```

Alternatively, use `yarn` if you prefer:

```
yarn add alfa
```

## Getting Data for Components

Alfa converts your regular React component into a **dependency injected component** by `injecting` application data from a key/value store. Let Alfa handle the data if you use it in different components:

```jsx
// hello.js
import React from 'react'
import { inject } from 'alfa'

// A stateless functional component.
function HelloMessage(props) {
  // Data is injected as the property of props.
  return <div>Hello ${props.name}!</div>
}

export default inject(HelloMessage, ['name'])
```

`inject` makes a new component which gets data `name` from the store and renders `HelloMessage` internally.

Now let's see how to use the above component in our app:

```jsx
// index.js
import React from 'react'
import { render } from 'react-dom'
import { inject } from 'alfa'
import HelloMessage from './hello.js'

// Define the root app which renders HelloMessage as a child.
const App = () => (
  <div>
    <HelloMessage />
  </div>
)

// Create the root component using `inject(Component, data)` with initial data.
const Root = inject(App, {
  name: 'Motoko'
})

render(<Root />, document.getElementById('root'))
```

We don't need to pass the `name` to `HelloMessage` component as Alfa gets that value for us from the store. That allows us to quickly move the component around without worrying about how to get the data.

## Changing Data

The simplest way to modify the data of the Alfa store is to inject the `set` function to the component.

```jsx
// change.js
import React, { Component } from 'react'
import { inject } from 'alfa'

// A stateful class component.
class ChangeName extends Component {
  handleChange = event => {
    // Calling `set('mykey', 'my value')` will change the data `mykey`
    // in store to value `my value`.
    this.props.set('name', event.target.value)
  }

  handleSubmit = event => {
    event.preventDefault()
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={this.props.name}
            onChange={this.handleChange}
          />
        </label>
      </form>
    )
  }
}

export default inject(ChangeName, ['set', 'name'], ['name'])
```

As mentioned earlier Alfa makes things explicit. So we need to define the `output` of the component explicitly if we want to change a value of a key in the global data store (the 3rd argument when calling function `inject`). Otherwise, Alfa complains we are trying to use `set` without defining the correct `output`.

Now add the `ChangeName` component to `App`:

```jsx
const App = () => (
  <div>
    <HelloMessage />
    <ChangeName />
  </div>
)
```

If you run the app and modify the value in the input field, the `name` on the page do not change? Why?

Because components made by `inject` does not trigger re-render when we change the injected state in the store. We need to replace it with another function called `subscribe`.

## Subscribing Data

We need to call `subscribe` instead of `inject` if we want to trigger the re-render of the component when changing the data. Simply swap `inject` with `subscribe`, and you can see the name is changing when you are typing in the input field:

```jsx
// hello.js
import { subscribe } from 'alfa'

//...

// Use function `subscribe` instead of `inject`.
export default subscribe(HelloMessage, ['name'])
```

```jsx
// change.js
import { subscribe } from 'alfa'

//...

// Use function `subscribe` instead of `inject`.
export default subscribe(ChangeName, ['set', 'name'], ['name'])
```

The `subscribe` has exactly same API as `inject`. The reason why Alfa provides two functions with slightly different behavior is to let the application developers clear about the type of data they are dealing with - static or dynamic. It not only makes the app more performant but also makes it easier to understand.

You can find the finished version of the above example in the folder [examples/hello](https://github.com/lsm/alfa/tree/master/examples/hello).
