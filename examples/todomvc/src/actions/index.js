import { action } from 'alfa'

export const addToDo = action(
  function({ text, todos }) {
    var resultTodos

    if (!text) {
      resultTodos = todos
    } else {
      resultTodos = todos.concat([
        {
          id: Math.random(),
          text: text,
          completed: false
        }
      ])
    }

    return {
      todos: resultTodos
    }
  },
  ['text', 'todos'],
  'todos'
)

export const completeTodo = action(
  function({ todos, todoID }) {
    var resultTodos = todos.map(function(todo) {
      return {
        id: todo.id,
        text: todo.text,
        completed: todoID === todo.id ? !todo.completed : todo.completed
      }
    })

    return {
      todos: resultTodos
    }
  },
  ['todos', 'todoID'],
  'todos'
)

export const deleteTodo = action(
  function({ set, todoID, todos }) {
    var resultTodos = todos.filter(function(todo) {
      return todoID !== todo.id
    })

    // Simulate an async operation.
    setTimeout(function() {
      set({
        todos: resultTodos
      })
    }, 100)
  },
  ['todoID', 'todos'],
  'todos'
)

export const editTodo = action(
  function({ todoID, todoText, todos }) {
    var resultTodos = todos.map(function(todo) {
      if (todoID === todo.id) todo.text = todoText
      return todo
    })

    return {
      todos: resultTodos
    }
  },
  ['todos', 'todoID', 'todoText'],
  'todos'
)

export const completeAll = action(
  function({ todos }) {
    return {
      todos: todos.map(todo => ({
        ...todo,
        completed: !todo.completed
      }))
    }
  },
  'todos',
  'todos'
)

export const clearCompleted = action(
  function({ todos }) {
    return {
      todos: todos.filter(function(todo) {
        return false === todo.completed
      })
    }
  },
  'todos',
  'todos'
)
