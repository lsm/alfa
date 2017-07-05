import { set, action } from 'alfa'
import * as pipes from './pipes'

// Set all pipes to the store.
set(pipes)


action('addToDo')
  .pipe('input', ['newTodoText'])
  .pipe('createTodo', ['todos', 'newTodoText'], ['todos'])
  .pipe('output', ['todos'])

action('completeTodo')
  .input('todoID')
  .pipe('toggleTodoComplete', ['todos', 'todoID'], 'todos')
  .output(['todos'])

action('deleteTodo')
  .input(['todoId'])
  .pipe('removeTodoByID', ['todoId', 'todos', 'next'], 'todos')
  .output('todos')

action('editTodo')
  .input(['todoId', 'todoText'])
  .pipe('updateTodo', ['todoId', 'todoText', 'todos'], 'todos')
  .output('todos')


action('completeAll', todos => {
  return {
    todos: todos.map(todo => ({
      ...todo,
      completed: !todo.completed
    }))
  }
}, 'todos', 'todos')


action('clearCompleted', function(todos) {
  return {
    todos: todos.filter(function(todo) {
      return false === todo.completed
    })
  }
}, 'todos', 'todos')
