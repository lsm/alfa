import React from 'react'
import { render } from 'react-dom'
import { set } from 'alfa'
import App from './containers/App'
import * as TODO_FILTERS from './constants/TodoFilters'

import './actions'
import 'todomvc-app-css/index.css'

/**
 * Set initial state of applicaiton.
 */
set('todos', [])
set('filter', TODO_FILTERS.SHOW_ALL)

/**
 * Render our application.
 */
render(<App />, document.getElementById('root'))
