import { provide, subscribe } from 'alfa'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../constants/TodoFilters'

const FILTER_TITLES = {
  [SHOW_ALL]: 'All',
  [SHOW_ACTIVE]: 'Active',
  [SHOW_COMPLETED]: 'Completed'
}


class Footer extends Component {
  static propTypes = {
    filter: PropTypes.string.isRequired,
    activeCount: PropTypes.number.isRequired,
    completedCount: PropTypes.number.isRequired,
    clearCompleted: PropTypes.func.isRequired,
  }

  renderTodoCount() {
    const {activeCount} = this.props
    const itemWord = 1 === activeCount ? 'item' : 'items'

    return (
      <span className="todo-count"><strong>{ activeCount || 'No' }</strong> { itemWord } left</span>
    )
  }

  renderFilterLink(filter) {
    const title = FILTER_TITLES[filter]
    const {filter: selectedFilter} = this.props
    const css = classnames({
      selected: filter === selectedFilter
    })
    return (
      <a className={ css }
         style={ { cursor: 'pointer' } }
         onClick={ () => this.props.set('filter', filter) }>
        { title }
      </a>
    )
  }

  renderClearButton() {
    const {completedCount, clearCompleted} = this.props
    if (completedCount > 0) {
      return (
        <button className="clear-completed"
                onClick={ clearCompleted }>
          Clear completed
        </button>
      )
    }
  }

  render() {
    return (
      <footer className="footer">
        { this.renderTodoCount() }
        <ul className="filters">
          { [SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED].map(filter => <li key={ filter }>
                                                                    { this.renderFilterLink(filter) }
                                                                  </li>
            ) }
        </ul>
        { this.renderClearButton() }
      </footer>
    )
  }
}

export default subscribe(Footer, ['set', 'filter', 'completeAll', 'clearCompleted'], ['filter'])
