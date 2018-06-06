import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import TodoTextInput from './TodoTextInput'
import { inject } from 'alfa'

class TodoItem extends Component {
  static propTypes = {
    todo: PropTypes.object.isRequired,
    editTodo: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired,
    completeTodo: PropTypes.func.isRequired
  }

  state = {
    editing: false
  }

  handleDoubleClick = () => {
    this.setState({
      editing: true
    })
  }

  handleSave = (todoID, todoText) => {
    if (0 === todoText.length) this.props.deleteTodo({ todoID })
    else this.props.editTodo({ todoID, todoText })
    this.setState({
      editing: false
    })
  }

  render() {
    const { todo, completeTodo, deleteTodo } = this.props

    let element
    if (this.state.editing) {
      element = (
        <TodoTextInput
          text={todo.text}
          editing={this.state.editing}
          onSave={text => this.handleSave(todo.id, text)}
        />
      )
    } else {
      element = (
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={todo.completed}
            onChange={() => completeTodo({ todoID: todo.id })}
          />
          <label onDoubleClick={this.handleDoubleClick}>{todo.text}</label>
          <button
            className="destroy"
            onClick={() => deleteTodo({ todoID: todo.id })}
          />
        </div>
      )
    }

    const css = classnames({
      completed: todo.completed,
      editing: this.state.editing
    })
    return <li className={css}>{element}</li>
  }
}

export default inject(
  TodoItem,
  ['editTodo', 'deleteTodo', 'completeTodo'],
  ['todos']
)
