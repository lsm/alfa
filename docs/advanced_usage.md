# Advanced Usage

The hello world example we discussed in the [Quick Guide](https://lsm.github.io/alfa/#/?id=quick-guide) introduced 3 functions `set, provide, and subscribe`. In this chapter, we cover more advanced usages which help you writing more performant code and organizing them better.

## Inject instead of subscribing

Alfa has another function called `inject` and here's how you can use it:

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

As you may see `inject` has the same interface as `subscribe`. The only difference is changing the value of the injected key (`title` in this case) does not trigger the rerender of the component. Which means it's the perfect choice for static components which won't change after the initial render. Using inject in this case makes your code more performant and use less memory since it does not have to monitor changes of its dependencies.

## Action

In the [Quick Guide](https://lsm.github.io/alfa/#/?id=quick-guide) we learned we could use `set` function to make changes to the store in a component. However, it is common that you have the same piece of code which uses `set` to change some keys in the store. Also, you want to reuse it in different components. Then `action` is the function to help you create reusable functions that mutate the store which can be used across components. For a large code base, it also helps you to separate the business logic from you representation code and let you understand what component is doing what. (e.g., if a component needs an action called `addTodo` then it probably can add a new todo.)

### How to Define an Action?

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
    // We have `text` then construct a new todo item using it and concat the new
    // todo item with the old todos array.  This causes rerender.
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

Like the design of `inject/subscribe`, `action` make it explicit about what are the input and output of the action function. Alfa enforces the output part and throws an error if you return something that is not predefined in the output:

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

For asynchronous operations we can use `set` in the action function to change the store just like what we have done in the Quick Guide:

```jsx
function deleteToDoAction({ set, todos, todoID }) {
  var resultTodos = todos.filter(function(todo) {
    return todoID !== todo.id
  })

  // Simulate an async operation.
  setTimeout(function() {
    set({ todos: resultTodos })
    // You can call `set` as many times as you want.
    set({ todosCount: todos.length })
  }, 100)
}

export const deleteTodo = action(
  deleteToDoAction,
  ['todoID', 'todos'],
  ['todos', 'todosCount']
)
```

Since the purpose of the action functions is making changes to the store, so the `set` function is `pre-injected` - you don't have to define it as an input of the action function.

### How to use action in the component?

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
}

// ...

export default inject(TodoItem, ['deleteTodo'])
```
