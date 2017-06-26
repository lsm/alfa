import createPipeline from './pipeline'

export default function createAction(alfa) {
  return function action(name, definitions, input, output) {
    if (!name || 'string' !== typeof name)
      throw new Error('`name` is required for creating an action.')

    var pipeline = alfa.get(name)
    if (pipeline)
      return pipeline

    if (!definitions) {
      pipeline = createPipeline()
    } else if ('function' === typeof definitions) {
      // Normalize definitions
      definitions = [[definitions, input, output]]
      // Add an output pipe if it's provided in this special case.
      if (output)
        definitions[1] = ['output', output]
    }

    if (!pipeline)
      pipeline = createPipeline(definitions)

    alfa.set(name, pipeline)

    return pipeline
  }
}

