import React from 'react'
import { subscribe } from 'alfa'

class ChangeName extends React.Component {
  onChange = event => {
    this.props.set('name', event.target.value)
  }

  render() {
    return (
      <label>
        Name:
        <input type="text" value={this.props.name} onChange={this.onChange} />
      </label>
    )
  }
}

export default subscribe(ChangeName, ['set', 'name'], ['name'])
