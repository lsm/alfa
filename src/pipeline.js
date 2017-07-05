import { executePipe } from './pipe/executor'
import { setRawStore, isPlainObject } from './store'
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
    // Do nothing where there's no pipe at all.
    if (0 === _pipes.length)
      return

    /**
     * Start from the first pipe of the pipeline.
     * @type {Number}
     */
    var step = 0

    /**
     * Convert original function arguments to array.
     * 
     * @type {Array}
     */
    const _args = Array.from(arguments)

    /**
     * Make a shallow clone of the key/value store.
     * 
     * @type {Object}
     */
    const _rawStore = store.clone()

    /**
     * The `set` function can only modified the cloned raw store and will
     * not trigger any listening function.
     *  
     * @param {String|Object}   key   Name of the value in store.  Or object of
     * key/value pairs to merge into the store. 
     * @param {Any}             value Value to save.
     */
    _rawStore.set = function(key, value) {
      setRawStore(_rawStore, key, value)
    }


    var previousPipeState

    /**
     * The pipeline execution function.
     * @param  {[type]}   err   [description]
     * @param  {[type]}   key   [description]
     * @param  {[type]}   value [description]
     * @return {Function}       [description]
     */
    var next = function next(err, key, value) {
      if (previousPipeState && arguments.length > 1) {
        // `next` could be called before the return of previous pipe so we need
        // to set the `autoNext` flag of previous pipe state to false to avoid
        // `double next`.
        previousPipeState.autoNext = false

        // We have more than one argument which means the previous pipe produced
        // some output by calling `next`.  We need to merge this output with 
        // rawStore before executing the next pipe.
        mergeOutputWithRawStore(_rawStore, key, value)
      }

      // Save error to the raw store or get one from it.  This will make sure 
      // error will be handled properly no matter how it was set.
      if (err)
        _rawStore.error = err
      else
        err = _rawStore.error

      var pipe

      if (err) {
        // Throw the error if we don't have error handling function.
        if ('function' !== typeof _rawStore.errorHandler) {
          var fnName = previousPipeState && previousPipeState.fnName
          fnName = fnName || previousPipeState.fn.name || 'function'
          throwError(err, name, step, fnName)
        }

        pipe = _rawStore.errorHandler
      } else {
        // Get current pipe and add 1 to the step.
        pipe = _pipes[step++]
      }

      if (pipe) {
        /**
         * Object for holding execution state, result and other references
         * of certain pipe for executing pipeline continously.
         * 
         * @type {Object}
         */
        const pipeState = {
          ...pipe,
          next: next,
          result: undefined,
          fnReturned: false
        }

        /**
         * Keep a reference to pipeState for better error handling.
         * @type {Object}
         */
        previousPipeState = pipeState

        // Excute the pipe.
        executePipe(err, _args, store, _rawStore, pipeState)
      }
    }

    // Save next to the raw store so pipes could retrieve it as input.
    _rawStore.next = next

    // Start executing the chain
    next()
  }

  pipeline.instanceOfAlfaPipeline = true

  if (definitions) {
    _pipes = definitions.map(function(pipeDef) {
      return createPipe(pipeDef[0], pipeDef[1], pipeDef[2])
    })
  } else {
    _pipes = attachPipelineFunctions(pipeline)
  }

  return pipeline
}


/**
 * Pipeline instance functions
 */

function attachPipelineFunctions(pipeline) {
  const pipes = []

  pipeline.input = function(input) {
    var p = createPipe(FN_INPUT, input)
    pipes.push(p)
    return pipeline
  }

  pipeline.pipe = function(fn, input, output) {
    var p = createPipe(fn, input, output)
    pipes.push(p)
    return pipeline
  }

  pipeline.wait = function(input) {
    var p = createPipe(FN_WAIT, input)
    pipes.push(p)
    return pipeline
  }

  pipeline.output = function(input) {
    var p = createPipe(FN_OUTPUT, input)
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


function throwError(error, name, step, pipe) {
  var ex = error

  if ('string' === typeof error) {
    ex = new Error()
    ex.name = `Pipeline "${name}" error in step "${step}:${pipe}":
    \n(set "errorHandler" to handle this error inside your pipeline.)`
    ex.message = error
  }

  throw ex
}

function mergeOutputWithRawStore(rawStore, key, value) {
  if ('string' === key && key)
    rawStore[key] = value

  if (isPlainObject(key)) {
    Object.keys(key).forEach(function(_key) {
      rawStore[_key] = key[_key]
    })
  }
}
