import { app } from 'alfa'
import React from 'react'
import { render } from 'react-dom'
import App from './containers/App'
import * as TODO_FILTERS from './constants/TodoFilters'

import './actions'
import 'todomvc-app-css/index.css'


/**
 * Set initial state of applicaiton and bind it with alfa.
 */
const Root = app(App, {
  todos: [],
  filter: TODO_FILTERS.SHOW_ALL
})

/**
 * Render our application.
 */
render(<Root />, document.getElementById('root'))
