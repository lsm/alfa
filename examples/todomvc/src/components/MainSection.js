import { subscribe } from '../alfa'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TodoItem from './TodoItem'
import Footer from './Footer'


export class MainSection extends Component {
  static propTypes = {
    todos: PropTypes.array.isRequired,
    filter: PropTypes.string.isRequired,
    completeAll: PropTypes.func.isRequired,
  }

  renderToggleAll(completedCount) {
    const {todos, completeAll} = this.props
    if (todos.length > 0) {
      return (
        <input className="toggle-all"
               type="checkbox"
               checked={ completedCount === todos.length }
               onChange={ completeAll } />
      )
    }
  }

  renderFooter(completedCount) {
    const {todos} = this.props
    const activeCount = todos.length - completedCount

    if (todos.length) {
      return (
        <Footer completedCount={ completedCount }
                activeCount={ activeCount } />
      )
    }
  }

  render() {
    const {todos} = this.props
    // const {filter} = this.state

    const filteredTodos = todos.filter(function(todo) {
      return todo
    })
    const completedCount = todos.reduce((count, todo) => todo.completed ? count + 1 : count,
      0
    )

    return (
      <section className="main">
        { this.renderToggleAll(completedCount) }
        <ul className="todo-list">
          { filteredTodos.map(todo => <TodoItem key={ todo.id }
                                                todo={ todo } />
            ) }
        </ul>
        { this.renderFooter(completedCount) }
      </section>
    )
  }
}

export default subscribe(MainSection, ['todos', 'filter', 'completeAll'])
