

export function createTodo(todos, newTodoText) {
  return {
    todos: todos.concat([{
      id: Math.random(),
      text: newTodoText,
      completed: false
    }])
  }
}


export function saveTodo(todoID, todoText, todos) {
  var resultTodos = todos.map(function (todo) {
    if (todoID === todo.id)
      todo.text = todoText
    return todo
  })

  return {
    todos: resultTodos
  }
}


export function removeTodoByID(todoID, todos, next) {
  var resultTodos = todos.filter(function(todo) {
    return todoID !== todo.id
  })

  // Simulate a async operation.
  setTimeout(function() {
    next(null, {
      todos: resultTodos
    })
  }, 100)
}


export function toggleTodoComplete(todos, todoID) {
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
}
