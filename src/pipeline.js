import { createPipe, FN_WAIT, FN_INPUT, FN_OUTPUT, FN_THROTTLE } from './pipe/builder'


export default function createPipeline(name, store, definitions) {
  /**
   * Internal array which holds all the normalized pipes.
   * @type {Array}
   */
  var _pipes

  /**
   * Instance of pipeline
   */
  function pipeline() {
    var args = Array.from(arguments)

  }

  pipeline.instanceOfAlfaPipeline = true

  if (definitions) {
    _pipes = definitions.map(function(pipeDef) {
      return createPipe(pipeline, pipeDef[0], pipeDef[1], pipeDef[2])
    })
  } else {
    _pipes = attachPipelineFunctions(pipeline)
  }
}


/**
 * Pipeline instance functions
 */

function attachPipelineFunctions(pipeline) {
  const pipes = []

  pipeline.input = function(input) {
    var p = createPipe(pipeline, FN_INPUT, input)
    pipes.push(p)
    return pipeline
  }

  pipeline.pipe = function(fn, input, output) {
    var p = createPipe(pipeline, fn, input, output)
    pipes.push(p)
    return pipeline
  }

  pipeline.wait = function(input) {
    var p = createPipe(FN_WAIT, input)
    pipes.push(p)
    return pipeline
  }

  pipeline.output = function(input) {
    var p = createPipe(pipeline, FN_OUTPUT, input)
    pipes.push(p)
    return pipeline
  }

  pipeline.throttle = function(input) {
    var p = createPipe(FN_THROTTLE, input)
    pipes.push(p)
    return pipeline
  }

  return pipes
}

