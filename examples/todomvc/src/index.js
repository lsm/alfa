import { Provider } from 'alfa'
import React from 'react'
import { render } from 'react-dom'
import App from './containers/App'
import * as TODO_FILTERS from './constants/TodoFilters'

import * as actions from './actions'
import 'todomvc-app-css/index.css'

/**
 * Initial state of applicaiton.
 */
const data = {
  todos: [],
  filter: TODO_FILTERS.SHOW_ALL,
  ...actions
}

/**
 * Render our application.
 */
render(
  <Provider data={data}>
    <App />
  </Provider>,
  document.getElementById('root')
)
