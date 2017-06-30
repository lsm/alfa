import createPipeline from './pipeline'

export default function createAction(store) {
  return function action(name, definitions, input, output) {
    if (!name || 'string' !== typeof name)
      throw new Error('`name` is required for creating an action.')

    var pipeline = store.get(name)
    if (pipeline)
      return pipeline

    if (!definitions) {
      pipeline = createPipeline(name, store)
    } else if ('function' === typeof definitions) {
      // Normalize definitions
      definitions = [[definitions, input, output]]
      // Add an output pipe if it's provided in this special case.
      if (output)
        definitions[1] = ['output', output]
    }

    if (!pipeline)
      pipeline = createPipeline(name, store, definitions)

    store.set(name, pipeline)

    return pipeline
  }
}

