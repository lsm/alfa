# Alfa

[![License MIT][license-img]][license-url]
[![NPM version][npm-img]][npm-url]
[![Downloads][down-img]][npm-url]
[![Dependencies][dep-image]][dep-url]
[![build status][travis-img]][travis-url]
[![Coverage Status][coverage-img]][coverage-url]
[![Code Climate][climate-img]][climate-url]

[![Sauce Test Status](https://saucelabs.com/browser-matrix/alfajs.svg)](https://saucelabs.com/u/alfajs)

Alfa is a library for React state management and flow control.  It is designed to have much **fewer noises and things to learn** compare with other solutions while at the same time provides your essential tools to keep your complex UI apps easy to reason about and change.  Here is a list of things why you want to use Alfa today:


## Why Alfa?

- **Less to learn and code** - Alfa brings fewer concepts. Learn 3 APIs and it will be good enough for a medium-sized React application.
- **Fast** - Alfa uses a flat key/value store internally. It Only triggers re-render when it's necessary.
- **Small footprints** - ~500LOC & 6KB minified + gzipped.
- **Make everything explicit** - Alfa lets you know what a component requires (input) and what changes it will make (output).
- **Easy to test** - Unit test your components as it is without Alfa. 
- **Sync and Async** - Alfa supports asynchronous operation natively without additional packages.
- **Server render** - Support isomorphic app out of the box.
- **Built-in flow control** - For complex app (But use it only when you need to).
- **Reusable & Encapsulated** - Adopt Alfa in a library or reusable components.  Users of your lib/component could but don't have to use Alfa at all.
- **(Anti-)Patterns for common problems** - Alfa has certain ways to do certain things, so you will not have doubts in daily development about what to use and how to organize your code.


## Add Alfa to your project

Use `npm` to add it to your package.json.

```
npm install --save alfa
```

Or use `yarn` if you prefer:

```
yarn add alfa
```

# Guide
Alfa has two major parts: state management & flow control. An application can use each part with or without the involvement of another part.


## State Management
[React](https://facebook.github.io/react/) is a perfect library for managing interactive and stateful views. But, things become unclear when you need to `share state across components`. That is exactly the thing why Alfa was created.

Alfa is designed based on the same simple idea of React: `one-way data flow`. The diagram below is the perfect answer if you ask how Alfa works:

```
             |-----------|
        | -> |   State   | ---|
changes |    |-----------|    | notifies
        |                     v
  |----------|           |----------|
  |  Action  | <-------- |   View   |
  |----------| triggers  |----------|
```

The above diagram is simple, and you don't need anything other than React to adopt this pattern. But, it does not tell what to do if we use and modify the same state in different components.  We can call this type of state `Shared State`.  Then we call the state which is used just inside a component `Local State`.

### Getting State from Alfa Store
Alfa could convert your regular React component into a `dependency injected component` by `providing` application states from the store.  So let Alfa handle the state if it is used in different places of your app:

```jsx
// hello.js
import React from 'react'
import {provide} from 'alfa'

class HelloMessage extends React.Component {
  render() {
    const message = `Hello ${this.props.name}!`
    return <div>
             { message }
           </div>
  }
}

export default provide(HelloMessage, ['name'])
```

Instead of exporting the `HelloMessage` directly we export the result of `provide(HelloMessage, ['name'])`.  `provide` makes a new component which gets state `name` from the store and renders `HelloMessage` internally.

Now let's see how to use the above component in our root app:

```jsx
// index.js
import React from 'react'
import { app } from 'alfa'
import { render } from 'react-dom'
import HelloMessage from './hello.js'


// Define the root app which renders HelloMessage as child.
const App = () => (
  <div>
    <HelloMessage/>
  </div>
)

// Bind App with alfa using `app(Component, data)` with initial data.
const Root = app(App, {
  name: 'Motoko'
})

render(<Root />, document.getElementById('root'))
```

We don't need to pass the `name` to `HelloMessage` component as Alfa will get that value for us from the store.  That allows us to quickly move the component around without worrying about how to get the data.


### Changing the State
The simplest way to modify the state of Alfa store is to provide the `set` function to the component which the changes will be made:

```jsx
// change.js
import React, { Component } from 'react'
import { provide } from 'alfa'

class ChangeName extends Component {

  handleChange = (event) => {
    this.props.set('name', event.target.value)
  }

  handleSubmit = (event) => {
    event.preventDefault()
  }

  render() {
    return (
      <form onSubmit={ this.handleSubmit }>
        <label>
          Name:
          <input type="text"
                 value={ this.props.name }
                 onChange={ this.handleChange } />
        </label>
      </form>
    )
  }
}

export default provide(ChangeName, ['set', 'name'], ['name'])
```
As mentioned earlier Alfa makes things explicit.  So we need to define it explicitly and correctly if we want to change a state in a component (the 3rd argument when calling function `provide`).  Otherwise, Alfa will complain we are trying to use `set` without defining any or the correct `output`.


Now add the `ChangeName` component to `App`:

```jsx
const App = () => (
  <div>
    <HelloMessage/>
    <ChangeName/>
  </div>
)
```

If you run the app and try modifying the value in the input field, the `name` on the page will not be changed?  Why?

Because components made by `provide` will not trigger re-render when we change the provided state in the store.  We will need to replace it with another function called `subscribe`.

### Subscribing State
We need to call `subscribe` instead of `provide` if we want to trigger the re-render of the component when we change the state. Simply swap `provide` with `subscribe` and you will see the name is changing when you are typing in the input field:

```jsx
// hello.js
import {subscribe} from 'alfa'

//...

export default subscribe(HelloMessage, ['name'])
```

```jsx
// change.js
import {subscribe} from 'alfa'

//...

export default subscribe(ChangeName, ['set', 'name'], ['name'])
```

The `subscribe` has exactly same API as `provide`. The reason why Alfa provides two functions with slightly different behavior is to let the application developers clear about the type of states they are dealing with - static or dynamic. It not only makes the app more performant but also makes it easy to understand.

You can find the finished version of the above example in the folder [examples/hello](https://github.com/lsm/alfa/tree/master/examples/hello).

## Flow control

*to be continued*


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
