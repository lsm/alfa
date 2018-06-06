import React from 'react'
import TodoTextInput from './TodoTextInput'

const Header = props => {
  return (
    <header className="header">
      <h1>todos</h1>
      <TodoTextInput newTodo placeholder="What needs to be done?" />
    </header>
  )
}

export default Header
