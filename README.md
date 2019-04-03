# Alfa

> Effortless React State Management.

[![CI status][ci-img]][ci-url]
[![License MIT][license-img]][license-url]
[![NPM version][npm-img]][npm-url]
[![Dependencies][dep-image]][dep-url]
[![Coverage Status][coverage-img]][coverage-url]
[![Code Climate][climate-img]][climate-url]

![Alfa - Effortless React State Management](https://raw.githubusercontent.com/lsm/alfa/master/docs/alfa.gif)

## Why Alfa?

[React](https://facebook.github.io/react/) is an excellent library for creating interactive and stateful views. However, things become unclear when you need to `share & change data across components`.

Alfa offers an **intuitive and straightforward way** to manage React state. It completely decouples the complex relationships between components and lets you focus on making **components that work anywhere**.

Its **simple** design allows you to adopt it in a matter of minutes while at the same time provides your essential tools to keep your application code easy to change and understand. Here is a list of things why it is the perfect fit for your next React app:

- **Easy** &ndash; Only 4 functions/APIs to learn.
- **Fast** &ndash; Alfa wraps your components with a thin layer. It introduces little to no performance impacts.
- **Small** &ndash; ~190LOC & 3KB minified + gzipped.
- **Async** &ndash; Alfa supports asynchronous operations natively without additional packages.
- **Explicit** &ndash; Alfa lets you know what a component requires **(input)** and what it changes **(output)**.
- **Transparent** &ndash; You can use and unit test your components as they are without Alfa. Users of your lib/component could but don't have to use Alfa at all.
- **React Native** &ndash; Supports React Native out of the box.
- **Server Render** &ndash; Supports isomorphic apps out of the box.
- **Production Ready** &ndash; 100% test coverage and being used in productions.

## Links

- [Documentation](https://lsm.github.io/alfa)
- [Hello World Example](https://github.com/lsm/alfa/tree/master/examples/hello)
- [TodoMVC Example](https://github.com/lsm/alfa/tree/master/examples/todomvc)

## Quick Guide

### Installation

Use `npm` to add it to your `package.json`.

```sh
npm install --save alfa
```

Alternatively, use `yarn` if you prefer:

```sh
yarn add alfa
```

### Getting Data for Components

Alfa converts your regular React component into a **dependency injected component** by `injecting` application data from a key/value store. Let Alfa handle the data if you use it in different components:

```jsx
// hello.js
import React from 'react'
import { subscribe } from 'alfa'

// A stateless functional component.
function HelloMessage(props) {
  // Data is injected as the property of props.
  return <div>Hello ${props.name}!</div>
}

export default subscribe(HelloMessage, ['name'])
```

`subscribe` makes a new component which gets the variable `name` and feeds it into the `HelloMessage` as `props.name` on (re-)rendering.

Now let's see how to use the above component in our app:

```jsx
// index.js
import React from 'react'
import { render } from 'react-dom'
import { provide, subscribe } from 'alfa'

import HelloMessage from './hello.js'

// Define the root app which renders HelloMessage as a child.
const App = () => (
  <div>
    <HelloMessage />
  </div>
)

// Create the Root component by wrapping the App component with initial data
// using `provide(Component, data)`.
const Root = provide(App, { name: 'Motoko' })

// Render it!
render(<Root />, document.getElementById('root'))
```

You don't need to pass the variable `name` to `HelloMessage` as Alfa gets it from the store and passes it to `HelloMessage` component automatically. It allows us to quickly move the component around without worrying about how to get the data it depends on.

### Changing Data

The simplest way to modify the data of the Alfa store is to inject the built-in `set` function to the component.

```jsx
// change.js
import { subscribe } from 'alfa'
import React, { Component } from 'react'

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

export default subscribe(ChangeName, ['set', 'name'], ['name'])
```

As mentioned earlier, Alfa makes things explicit. So we need to define the `output` (the 3rd argument when calling the `subscribe` function) of the component explicitly if we want to change a value of a key in the data store. Otherwise, Alfa complains that we are trying to use `set` without defining the correct `output`.

Now add the `ChangeName` component to `App` and your `index.js` ends up like this:

```jsx
// index.js
import React from 'react'
import { render } from 'react-dom'
import { Provider, subscribe } from 'alfa'

import HelloMessage from './hello.js'

const App = () => (
  <div>
    <HelloMessage />
    <ChangeName />
  </div>
)

// Alternatively, you can use Provider - the declarative interface of the
// provide function.
render(
  <Provider data={{ name: 'Motoko' }}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

Now each time you make a change in the input box, React will re-render both `HelloMessage` and `ChangeName` components to reflect the change.

You can find the finished version of the above example in the folder [`examples/hello`](https://github.com/lsm/alfa/tree/master/examples/hello).

Please check the documentation for [API](https://lsm.github.io/alfa/#/api) and [advanced usages](https://lsm.github.io/alfa/#/advanced_usage).

# Advanced Usage

The hello world example we discussed in the [Quick Guide](https://lsm.github.io/alfa/#/?id=quick-guide) introduced 3 functions `set`, [`provide`](/api#providecomponent-data), and [`subscribe`](/api#subscribecomponent-input-output). In this chapter, we cover more advanced usages which help you writing more performant code and organizing them better.

## Inject instead of subscribing

Alfa has another function called [`inject`](/api#injectcomponent-input-output) and here's how you can use it:

```jsx
Import React from 'react'
import { inject } from 'alfa'

class SomeComponent extends React.Component {
  render() {
    return (<h1>this.props.title</h1>)
  }
}

export default inject(SomeComponent, ['title'])
```

As you may see [`inject`](/api#injectcomponent-input-output) has the same interface as [`subscribe`](/api#subscribecomponent-input-output). The only difference is changing the value of the injected key (`title` in this case) does not trigger the rerender of the component. Which means it's the perfect choice for static components which won't change after the initial render or dummy components which might be changed only through their parents. Using inject in this case makes your code more performant and use less memory since it does not have to monitor changes of its dependencies like the [`subscribe`](/api#subscribecomponent-input-output) does.

## Action

### What is an Action Function?

In the [Quick Guide](https://lsm.github.io/alfa/#/?id=changing-data) we learned we could use `set` function to make changes to the store in a component. However, it is common that you want to reuse the same piece of code which uses `set` to change some keys in the store. Then [`action`](/api#actionactionfunction-input-output) is the function to help you create reusable functions that mutate the store which can be used across components. For a large code base, it also helps you to separate the business logic from you representation code and let you understand what component is doing what. (e.g., if a component needs an action called `addTodo` then it probably can add a new todo). An action function is a function that give you the ability to read from and write to the store.

### How to Define an Action?

To define an action function you need to import the [`action`](/api#actionactionfunction-input-output) function from [`alfa`](https://github.com/lsm/alfa) first, then call it with your original function and the input/output desired.

```js
import { action } from 'alfa'

let actionFunction = action(someFunction, inputs, outputs)
```

Here is an example from the [TodoMVC example](https://github.com/lsm/alfa/blob/master/examples/todomvc/src/actions/index.js):

```jsx
import { action } from 'alfa'

// Action functions only take one argument which must be an object.
function addToDoAction({ text, todos }) {
  var resultTodos

  if (!text) {
    // No `text` then we change nothing. The new todos will be the old one.
    // This will not trigger rerender of the components which subscribe to the
    // `todos` key.

    resultTodos = todos
  } else {
    // We have `text` then construct a new todo item using it and make a new
    // todos array out of the old one. This causes rerender if you return it
    // (see the return statement at the end of this function).

    resultTodos = todos.concat([
      {
        id: Math.random(),
        text: text,
        completed: false
      }
    ])
  }

  // Now replace the new todos with the old one and return it.
  // Return of action function must be an object.

  return {
    todos: resultTodos
  }
}

// `action` takes three arguments: the action function, inputs and outputs.
// It returns the `addToDoAction` function with a new property `alfaAction`
// attached. The `alfaAction` function is a curry function which takes a `store`
// instance and returns a `dependency-injected` version of the `addToDoAction`
// function.

export const addToDo = action(addToDoAction, ['text', 'todos'], 'todos')
```

Like the design of `inject/subscribe`, [`action`](/api#actionactionfunction-input-output) make it explicit about what are the input and output of the action function. Alfa enforces the output part and throws an error if you return something that is not predefined in the output:

```js
action(
  function({ input1 }) {
    return {
      // This is a legit output.
      output1: 'some result',

      // This causes alfa to throw an error.
      randomOutput: 'some value'
    }
  },
  'input1',
  'output1'
)
```

### Asynchronous Action

For asynchronous operations we can use `set` in the action function to change the store just like what we have done in the [Quick Guide](https://lsm.github.io/alfa/#/?id=changing-data):

```jsx
function deleteToDoAction({ set, todos, todoID }) {
  var resultTodos = todos.filter(function(todo) {
    return todoID !== todo.id
  })

  // Simulate an async operation.
  setTimeout(function() {
    set({ todos: resultTodos })
    // You can call `set` as many times as you want.
    set('todosCount', todos.length)
  }, 100)
}

export const deleteTodo = action(
  deleteToDoAction,
  ['todoID', 'todos'],
  ['todos', 'todosCount']
)
```

Since the purpose of the action functions is making changes to the store, so the `set` function is `pre-injected` - you don't have to define it as an input of the action function.

### How to Use Action in Components?

To use the actions we first need to set them in the store. Alfa then binds the function with the instance of the store, so you don't have to worry about which store it works with when you call the action functions.

```jsx
import React from 'react'
import { Provider } from 'alfa'

import TodoApp from './App'
import * as todoActions from './todo-actions'

/**
 * Initial state of applicaiton.
 */
const data = {
  // Actions must be first level keys.
  addToDo: todoActions.addToDo,

  deleteToDo: todoActions.deleteToDo

  // Yeah, we can simply use the spread syntax:
  ...todoActions
}

/**
 * Render our application.
 */
render(
  <Provider data={data}>
    <TodoApp />
  </Provider>,
  document.getElementById('root')
)
```

Then in the component, we can get it as a normal dependency:

```jsx
// ...

class TodoItem extends Component {
  // ...

  onDeleteClick(todoID) {
    // The deleteTodo action also requires `todos` as input, but we don't have to
    // provide it here as alfa gets it from the store automatically.
    // Note, the parameters fed into the action here have higher priority
    // than the one injected from the store. It allows you to override the
    // input of the action when necessary.

    this.props.deleteTodo({ todoID })
  }

  // ...
}

// ...

export default inject(TodoItem, ['deleteTodo'])
```

## Dynamic Keys

### What is Dynamic Keys for?

To make changes to the store, [`alfa`](https://github.com/lsm/alfa) requires you to define the names of the outputs for both injected/subscribed components or action functions. What if the key you want to change is a dynamic value? For example, a unique id for a chat room? You can not predefine the output key in this case because it is data not code. Luckily, [`alfa`](https://github.com/lsm/alfa) supports this use case and it's called `Dynamic Keys`.

Another use case is when you want to load more dependencies based on the `props` of the component at initialization stage.

To use it you need to define a function as the static property [`keys`](/api#keysprops) for your component.

### How to Define Dynamic Keys?

Let's see how it works with a concrete example. Assume you have a chat app which supports multiple chat rooms and threading in a certain room. To control the open or the close of the threads you need to keep track of which thread is currently active in which chat room. We can use the combination of `roomID/activeThreadID` as the key to store the state of the active thread. For example, `{ alfadev/activeThreadID: 'thread23' }` means in chat room `alfadev` the current active thread id is `thread23`.

```jsx
// ...

class ChatRoom extends Component {
  // ...

  static keys = props => {
    return {
      chatRoom: props.roomID,
      // Each room can only have one active thread. If you room id is `alfadev`
      // then the key for storing active thread id of this room is
      // `alfadev/activeThreadID`
      activeThreadID: props.roomID + '/activeThreadID'
    }
  }

  // ...
}

// For functional component, add the `keys` property to the function itself.

function ChatRoom(props) {
  // ...
}

ChatRoom.keys = props => {
  return {
    chatRoom: props.roomID,
    activeThreadID: props.roomID + '/activeThreadID'
  }
}
```

### How to Use Dynamic Keys in Components?

The injected props in the component has static names (e.g., `chatRoom` and `activeThreadID`). You can get and set them as normal dependencies:

```js
// ...
let chatRoom = this.props.chatRoom
// ...
this.props.set('activeThreadID', 'thread56')
// ...
```

It helps you write clean and abstract code. Then in our example, a function to toggle the show/hide of the thread looks like this:

```jsx
// ...

class ChatRoom extends Component {
  // ...

  handleThreadToggle = () => {
    const { thread, activeThreadID } = this.props

    if (activeThreadID === thread.id) {
      this.props.set('activeThreadID', null)
    } else {
      this.props.set('activeThreadID', thread.id)
    }
  }

  // ...
}
```

When you call `this.props.set('activeThreadID', null)` Alfa maps the dynamic key back to the real key we defined in the return object of the [`keys`](/api#keysprops) function. In this case the `set` function call changes the value of the key `alfadev/activeThreadID` to `null` or the id of the thread.

Now defining the output of the ChatRoom component becomes more intuitive:

```js
export default subscribe(
  ChatRoom,
  ['set', 'activeThreadID'],
  ['activeThreadID']
)
```

You can find a full example for the usage of the dynamic keys in [injection.test.js](https://github.com/lsm/alfa/blob/master/test/injection.test.js) test case `Should set dynamic key correctly`.

## Multiple Stores

Sometimes you may want to have multiple stores for different sections of your application. It is easy to achieve with [`alfa`](https://github.com/lsm/alfa), all you need to do is put components under separate [`Providers`](/api#provider):

```jsx
function App() {
  return (
    <div>
      <Provider data={data1}>
        <SubApp1 />
      </Provider>
      <Provider data={data2}>
        <SubApp2 />
      </Provider>
    </div>
  )
}

render(<App />, document.getElementById('root'))
```

Now you won't have any conflicts even you have the same `key` in both `SubApp1` and `SubApp2` since they are under different [`Providers`](/api#provider) and stores.


# API

## provide(component, _data_)

Provide a store to the wrapped component and its children components

* **Parameters**

  * `component` - **required** `Function|Class`: Wrapped function or class (React component).
  * `data` - _optional_ `Object|Store`: Initial data object or instance of `alfa.Store`.

* **Return**

  `Function` - it returns a function which you can use it as a regular React component.

## Provider

The declarative interface of [`provide`](/api#providecomponent-data) function. It wraps a component and its children with an Alfa store.

```jsx
// `data` is optional as it is in `provide`.
<Provider data={Object | Store}>
  // Only one child is allowed.
  <SomeComponent />
</Provider>
```

## inject(component, _input_, _output_)

Inject data to the `component` as props based on the keys provided from `input`.

* **Parameters**

  * `component` - **required** `Function|Class`: Wrapped function or class (React component).
  * `input` - _optional_ `Array|String`: The keys of input dependencies. Could be a single string or array of strings.
  * `output` - _optional_ `Array|String`: The keys of output dependencies. Could be a single string or array of strings.

* **Return**

  * `Function` - it returns a function which we can use it as a regular React component.

## subscribe(component, _input_, _output_)

Subscribe data to the `component` as props based on the keys provided from `input`. Any changes made to the keys found in `input` triggers rerender of the component.

* **Parameters**

  * `component` - **required** `Function|Class`: Wrapped function or class (React component).
  * `input` - _optional_ `Array|String`: The keys of input dependencies. Could be a single string or array of strings.
  * `output` - _optional_ `Array|String`: The keys of output dependencies. Could be a single string or array of strings.

* **Return**

  * `Function` - it returns a function which you can use it as a standard React component.

## action(actionFunction, _input_, _output_)

Attach a curry function to the `actionFunction` which you can use it as `dependency-injected` version of `actionFunction` in components under a `Provider`.

* **Parameters**

  * `actionFunction` - **required** `Function`: The action function that makes changes to the store.
  * `input` - _optional_ `Array|String`: The keys of input dependencies. Could be a single string or array of strings.
  * `output` - _optional_ `Array|String`: The keys of output dependencies. Could be a single string or array of strings.

* **Return**

  * `Function` - it returns the original `actionFunction` with a curry function attached as property `alfaAction`.

## keys(props)

We can define function `keys` as a static property of a component or function to support dynamic names of injected/subscribed props. For subscribed component, Alfa calls it at initialization stage (constructor). For injected component, Alfa calls it every time before it renders. For either case, Alfa always calls it before rendering the wrapped component. Then we have the chance to get more dependencies based on the returns of the `keys` function and merge them with the `props` of the component. Dynamic keys have higher priority than the original properties in props. Which means a dynamic key overrides the value of the property if they are the same.

```js
  static keys(props) => {
    return {
      userSettings: props.userID + '/settings',
    }
    // Or return an array.
    return ['settings']
  }
```

* **Parameters**

  * props - `Object`: the original `props` of the component.

* **Return**

  * `Object|Array` - Object of the mapping between real keys and dynamic keys. Alternatively, an array of real keys. Concrete keys are the actual keys found in the store. Dynamic keys are the property names of the `props` accessible in the component. A dynamic name is like an alias of its corresponding concrete key which only lives in a component.

## Store(_data_)

The `Store` class. It implements a flat key/value store with the support of subscribing changes of keys with listening functions. You do not need it for most of the cases.

* **Methods**
  * constrcutor(_data_)
    * **Parameters**
      * data - _optional_ `Object`: The initial data for the store.
  - set(key, _value_)
    Change a value or values in the store.
    * **Parameters**
      * key - **required** `String|Object`: String value of the key. Alternatively, Object of key/value pairs when you need to set multiple values at once.
      * value - _optional_ `Any`: The value of the key.
  - get(key)
    Get value or values from the store.
    * **Parameters**
      * key - **required** `String|Array`: String value of the key. Alternatively, an array of keys when you need to retrieve multiple values at once.
    * **Return**
      * `Any` the value of the key or an object which contains the key/value pairs if the `key` was an array.
  - subscribe(keys, listener, _maps_)
    Call the listening function when `set` was called on any of the `keys`.
    * **Parameters**
      * keys - **required** `Array`: Array of keys the listener will be subscribing to.
      * listener - **required** `Function`: The listener function.
      * maps - _optional_ `Object`: Optional injection key to real key mappings.
  - unsubscribe(listener)
    Unsubscribe the function from all the keys it's listening to.
    * **Parameters**
      * listener - **required** `Function`: The listener function to unsubscribe.

# License

MIT

[dep-url]: https://david-dm.org/lsm/alfa
[dep-image]: https://david-dm.org/lsm/alfa.svg
[dev-url]: https://david-dm.org/lsm/alfa?type=dev
[dev-image]: https://david-dm.org/lsm/alfa/dev-status.svg
[license-img]: https://img.shields.io/badge/License-MIT-green.svg
[license-url]: http://opensource.org/licenses/MIT
[npm-img]: https://badge.fury.io/js/alfa.svg
[down-img]: https://img.shields.io/npm/dm/alfa.svg
[npm-url]: https://npmjs.org/package/alfa
[ci-img]: https://circleci.com/gh/lsm/alfa/tree/master.svg?style=shield
[ci-url]: https://circleci.com/gh/lsm/alfa/tree/master
[travis-img]: https://travis-ci.org/lsm/alfa.svg?branch=master
[travis-url]: http://travis-ci.org/lsm/alfa
[coverage-img]: https://coveralls.io/repos/github/lsm/alfa/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/lsm/alfa?branch=master
[climate-img]: https://codeclimate.com/github/lsm/alfa/badges/gpa.svg
[climate-url]: https://codeclimate.com/github/lsm/alfa
[saucelabs-url]: https://saucelabs.com/browser-matrix/alfajs.svg
