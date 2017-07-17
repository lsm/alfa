import createPipeline from './pipeline'

export default function createAction(store) {
  return function action(name, definitions, input, output) {
    if (!name || 'string' !== typeof name)
      throw new Error('`name` is required for creating an action.')

    var pipeline = store.get(name)
    if (pipeline)
      throw new Error(`Action "${name}" already defined.`)

    if (!definitions) {
      pipeline = createPipeline(name, store)
    } else if ('function' === typeof definitions) {
      // Normalize definitions
      definitions = [[definitions, input, output]]
      // Add an output pipe if it's provided in this special case.
      if (output)
        definitions[1] = ['output', output]
    } else if (!Array.isArray(definitions)) {
      throw new TypeError('Action definitions must be function, array or undefined.')
    }

    if (!pipeline)
      pipeline = createPipeline(name, store, definitions)

    store.set(name, pipeline)

    return pipeline
  }
}

