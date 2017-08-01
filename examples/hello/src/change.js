// change.js
import React, { Component } from 'react'
import { subscribe } from 'alfa'

class ChangeName extends Component {

  handleChange = (event) => {
    this.props.set('name', event.target.value)
  }

  handleSubmit = (event) => {
    event.preventDefault()
  }

  render() {
    return (
      <form onSubmit={ this.handleSubmit }>
        <label>
          Name:
          <input type="text"
                 value={ this.props.name }
                 onChange={ this.handleChange } />
        </label>
      </form>
    )
  }
}

export default subscribe(ChangeName, ['set', 'name'], ['name'])
