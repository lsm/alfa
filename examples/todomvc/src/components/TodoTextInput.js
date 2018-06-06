import { inject } from 'alfa'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

class TodoTextInput extends Component {
  static propTypes = {
    text: PropTypes.string,
    editing: PropTypes.bool,
    newTodo: PropTypes.bool,
    placeholder: PropTypes.string
  }

  state = {
    text: this.props.text || ''
  }

  handleSubmit = e => {
    const text = e.target.value.trim()

    if (13 === e.which) {
      this.props.addToDo({ text })

      if (this.props.newTodo) {
        this.setState({
          text: ''
        })
      }
    }
  }

  handleChange = e => {
    this.setState({
      text: e.target.value
    })
  }

  handleBlur = e => {
    if (!this.props.newTodo) {
      this.props.onSave(e.target.value)
    }
  }

  render() {
    const css = classnames({
      edit: this.props.editing,
      'new-todo': this.props.newTodo
    })
    return (
      <input
        className={css}
        type="text"
        placeholder={this.props.placeholder}
        autoFocus="true"
        value={this.state.text}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
        onKeyDown={this.handleSubmit}
      />
    )
  }
}

export default inject(TodoTextInput, ['addToDo'], ['todos'])
