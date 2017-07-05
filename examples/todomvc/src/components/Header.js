import { action } from 'alfa'
import React from 'react'
import TodoTextInput from './TodoTextInput'

const Header = () => {
  return (
    <header className="header">
      <h1>todos</h1>
      <TodoTextInput onSave={ action('addToDo') }
                     newTodo
                     placeholder="What needs to be done?" />
    </header>
  )
}

export default Header
