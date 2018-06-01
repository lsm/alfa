import { provide } from 'alfa'
import React from 'react'
import TodoTextInput from './TodoTextInput'

const Header = props => {
  return (
    <header className="header">
      <h1>todos</h1>
      <TodoTextInput
        onSave={props.addToDo}
        newTodo
        placeholder="What needs to be done?"
      />
    </header>
  )
}

export default provide(Header, ['addToDo'])
