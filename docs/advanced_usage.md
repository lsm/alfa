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

To define an action function you need to import the [`action`](/api#actionactionfunction-input-output) function from `alfa` first, then call it with your original function and the input/output desired.

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

To make changes to the store, `alfa` requires you to define the names of the outputs for both injected/subscribed components or action functions. What if the key you want to change is a dynamic value? For example, a unique id for a chat room? You can not predefine the output key in this case because it is data not code. Luckily, `alfa` supports this use case and it's called `Dynamic Keys`.

Another use case is you want to load more dependencies based on the `props` of the component at initialization stage.

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

Sometimes you may want to have multiple stores for different sections of your application. It is easy to achieve with `alfa`, all you need to do is put components under separate [`Providers`](/api#provider):

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
