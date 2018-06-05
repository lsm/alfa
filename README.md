# Alfa

[![License MIT][license-img]][license-url]
[![NPM version][npm-img]][npm-url]
[![Downloads][down-img]][npm-url]
[![Dependencies][dep-image]][dep-url]
[![build status][travis-img]][travis-url]
[![Coverage Status][coverage-img]][coverage-url]
[![Code Climate][climate-img]][climate-url]

[![Sauce Test Status](https://saucelabs.com/browser-matrix/alfajs.svg)](https://saucelabs.com/u/alfajs)

Alfa is a library for React state management. Its simple design allows you to adopt it in a matter of minutes while at the same time provides your essential tools to keep your application code easy to change and understand. Here is a list of things why you want to use Alfa today:

## Why Alfa?

* **Easy** - Only 4 functions/APIs to learn.
* **Fast** - Alfa wraps your components with a thin layer. It introduces a little or no performance impacts.
* **Small** - ~ 190LOC & 3KB minified + gzipped.
* **Async** - Alfa supports asynchronous operation natively without additional packages.
* **Explicit** - Alfa lets you know what a component requires (input) and what changes it makes (output).
* **Transparent** - You can use and unit test your components as it is without Alfa. Users of your lib/component could but don't have to use Alfa at all.
* **Server Render** - Support isomorphic app out of the box.
* **Production Ready** - 100% test coverage and being used in productions.

## Add Alfa to Your React Project

Use `npm` to add it to your package.json.

```
npm install --save alfa
```

Alternatively, use `yarn` if you prefer:

```
yarn add alfa
```

## Usage

[React](https://facebook.github.io/react/) is a perfect library for managing interactive and stateful views. However, things become unclear when you need to `share & change data across components` - that is **the only problem** Alfa focuses on solving.

### Getting the Data for Components

Alfa converts your regular React component into a `dependency injected component` by `injecting` application data from a key/value store. Let Alfa handle the data if you use it in different components of your app:

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

Now let's see how to use the above component in our root app:

```jsx
// index.js
import React from 'react'
import { app } from 'alfa'
import { render } from 'react-dom'
import HelloMessage from './hello.js'

// Define the root app which renders HelloMessage as a child.
const App = () => (
  <div>
    <HelloMessage />
  </div>
)

// Create the root component using `app(Component, data)` with initial data.
const Root = app(App, {
  name: 'Motoko'
})

render(<Root />, document.getElementById('root'))
```

We don't need to pass the `name` to `HelloMessage` component as Alfa gets that value for us from the store. That allows us to quickly move the component around without worrying about how to get the data.

### Changing the Data

The simplest way to modify the data of the Alfa store is to inject the `set` function to the component.

```jsx
// change.js
import React, { Component } from 'react'
import { inject } from 'alfa'

// A stateful class component.
class ChangeName extends Component {
  handleChange = event => {
    // Calling `set('mykey', 'my value')` will change the data `mykey` in store to value `my value`.
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

### Subscribing the Data

We need to call `subscribe` instead of `inject` if we want to trigger the re-render of the component when changing the data. Simply swap `inject` with `subscribe`, and you can see the name is changing when you are typing in the input field:

```jsx
// hello.js
import { subscribe } from 'alfa'

//...

export default subscribe(HelloMessage, ['name'])
```

```jsx
// change.js
import { subscribe } from 'alfa'

//...

export default subscribe(ChangeName, ['set', 'name'], ['name'])
```

The `subscribe` has exactly same API as `inject`. The reason why Alfa provides two functions with slightly different behavior is to let the application developers clear about the type of data they are dealing with - static or dynamic. It not only makes the app more performant but also makes it easier to understand.

You can find the finished version of the above example in the folder [examples/hello](https://github.com/lsm/alfa/tree/master/examples/hello).

## MIT License

[dep-url]: https://david-dm.org/lsm/alfa
[dep-image]: https://david-dm.org/lsm/alfa.svg
[dev-url]: https://david-dm.org/lsm/alfa?type=dev
[dev-image]: https://david-dm.org/lsm/alfa/dev-status.svg
[license-img]: https://img.shields.io/npm/l/alfa.svg
[license-url]: http://opensource.org/licenses/MIT
[npm-img]: https://badge.fury.io/js/alfa.svg
[down-img]: https://img.shields.io/npm/dm/alfa.svg
[npm-url]: https://npmjs.org/package/alfa
[travis-img]: https://travis-ci.org/lsm/alfa.svg?branch=master
[travis-url]: http://travis-ci.org/lsm/alfa
[coverage-img]: https://coveralls.io/repos/github/lsm/alfa/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/lsm/alfa?branch=master
[climate-img]: https://codeclimate.com/github/lsm/alfa/badges/gpa.svg
[climate-url]: https://codeclimate.com/github/lsm/alfa
