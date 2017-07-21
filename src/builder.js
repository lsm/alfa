export const FN_WAIT = 'wait'
export const FN_ERROR = 'error'
export const FN_INPUT = 'input'
export const FN_OUTPUT = 'output'
export const FN_THROTTLE = 'throttle'


/**
 * Put function and its dependencies to the pipeline.
 *
 * @param  {Function|String|Number|Array} fn
 *         - Function: The pipe function
 *         - String: Name of function which could be found in dependencies.
 *         - Number: Number of miliseconds to throttle the pipeline.
 *         - Array: A array which contains both `fn` (first) and `deps` (rest).
 * @param  {Array|String}   ...input String or array of names of dependencies.
 * @return {Pipeline}       Instance of this Pipeline.
 */
export function createPipe(fn, input, output) {
  var fnType = typeof fn

  if ('string' === fnType) {
    switch (fn) {
      case FN_INPUT:
        // .pipe('input', ['input1', 'input2'])
        inputIsRequired(input, fnType)
        return createInputPipe(input)
      case FN_OUTPUT:
        // .pipe('output', ['result'])
        inputIsRequired(input, fnType)
        return createOutputPipe(input)
      case FN_ERROR:
        // .pipe('error', 'theErrorHandler', ['input1', 'input2'])
        return createErrorPipe(input, output)
      case FN_THROTTLE:
        // .pipe('throttle', 300)
        inputIsRequired(input, fnType)
        return createThrottlePipe(input)
      case FN_WAIT:
        // .pipe('wait', 300)
        inputIsRequired(input, fnType)
        return createWaitPipe(input)
      default:
        return createInjectionPipe(fn, input, output)
    }
  } else if ('function' === fnType) {
    return buildPipe(fn, input, output)
  } else if ('number' === fnType) {
    return createThrottlePipe(fn)
  }

  throw new Error(`Unsupported pipe function type "${fnType}".`)
}

function inputIsRequired(input, fnType) {
  if (!input && 0 !== input)
    throw new Error(`'input' is required for ${fnType} pipe.`)
}

function onlyOneArgumentIsAllowed(args, name) {
  if (args.length > 1)
    throw new Error(`Only 1 argument is allowed for function "${name}".`)
}

function normalizeStringInput(input, fnType) {
  if ('string' === typeof input)
    input = [input]

  if (!Array.isArray(input) || !input.every(item => 'string' === typeof item))
    throw new Error(`'${fnType}' pipe requires string or array of strings as input.`)

  return input
}

function createInputPipe(input) {
  onlyOneArgumentIsAllowed(arguments)
  input = normalizeStringInput(input)

  return {
    fn: function inputPipe(args, store, rawStore) {
      input.forEach((item, idx) => {
        if (item)
          rawStore[item] = args[idx]
      })
      return true
    },
    fnName: FN_INPUT,
    input: input
  }
}

function createOutputPipe(input) {
  onlyOneArgumentIsAllowed(arguments)
  const output = normalizeStringInput(input)
  const outputMap = {}

  var i = 0
  const len = output.length

  while (i < len) {
    var item = output[i++]
    if (/:/.test(item)) {
      var mapping = item.split(':')
      outputMap[item] = {
        origKey: mapping[0],
        outputKey: mapping[1]
      }
    }
  }

  return {
    fn: function outputPipe(args, store, rawStore) {
      output.forEach(key => {
        if (key) {
          var origKey = key
          var outputKey
          var mapping = outputMap[key]
          if (mapping) {
            origKey = mapping.origKey
            outputKey = mapping.outputKey
            if (/^\$/.test(outputKey)) {
              // 'originalKey:$dynamicOutputKey'
              outputKey = rawStore[outputKey.slice(1)]
            }
            outputKey = outputKey || mapping.outputKey
          } else {
            outputKey = key
          }
          store.set(outputKey, rawStore[origKey])
        }
      })
      return true
    },
    fnName: FN_OUTPUT,
    input: output
  }
}

function createErrorPipe(errorFn, input) {
  input = normalizeStringInput(input || 'error')

  return {
    fn: function errorPipe(args, rawStore) {
      if ('string' === typeof errorFn)
        errorFn = rawStore[errorFn]
      if ('function' !== typeof errorFn)
        throw new Error(`The error handling function "${errorFn}" is not a function.`)

      errorFn.apply(0, args)
    },
    fnName: FN_ERROR,
    input: input
  }
}

function createWaitPipe(msec) {
  return {
    fn: function waitPipe(next) {
      setTimeout(function() {
        next()
      }, msec)
    },
    input: ['next'],
    fnName: FN_WAIT
  }
}

function createThrottlePipe(msec) {
  // Generate a throttle function and push to pipes
  var timestamp
  return {
    fn: function throttlePipe() {
      var now = new Date()
      if (!timestamp || now - timestamp > msec) {
        timestamp = new Date()
        return true
      } else {
        return false
      }
    },
    fnName: FN_THROTTLE
  }
}

/**
 * Create a pipe where the function is a dynamic value which will be injected
 * from the store at execution time.
 * 
 * @param  {String}         name    Name of the pipe function
 * @param  {Array|String}   input   String or array of names of inputs.
 * @param  {Array|String}   output  String or array of names of outputs.
 * @return {Object}                 Pipe definition object.
 */
function createInjectionPipe(name, input, output) {
  // Build the pipe.
  var pipe = buildPipe(null, input, output)

  // It's a `not` pipe if the pipe name is started with `!`.
  // Although the actual function name is the value without the exclamation mark.
  if (/^!/.test(name)) {
    pipe.not = true
    name = name.slice(1)
  }

  // It's an `optional` pipe if the name is ended with `?`.
  // The actual function name is the value without the question mark.
  if (/\?$/.test(name)) {
    pipe.optional = true
    name = name.slice(0, -1)
  }

  // Set the original function name to the pipe object 
  // for later dependency discovery.
  pipe.fnName = name
  return pipe
}

/**
 * The actual function for building a pipe.
 *
 * @param  {Function}       fn      The pipe function
 * @param  {Array|String}   input   String or array of names of inputs.
 * @param  {Array|String}   output  String or array of names of outputs.
 * @return {Object}                 Pipe definition object.
 */
function buildPipe(fn, input, output) {
  input = normalizeInput(input)
  output = normalizeOutput(output)

  // Return pipe object with function and its metadata.
  return {
    // Original function or null for injection pipe. It should never be changed.
    fn: fn,
    // loading/generating pipe functions dynamically.
    input: input,
    // `output` contains `output` array and `outputMap` object.
    output: output.output,
    outputMap: output.outputMap,
    // Set `autoNext` flag to true when no input is required 
    // or has input but next is not required as dependency.
    autoNext: !input || -1 === input.indexOf('next')
  }
}

function normalizeInput(input) {
  var inputType = typeof input
  if ('string' === inputType || 'number' === inputType || null === input)
    input = [input]

  if (input && !Array.isArray(input)) {
    if ('object' === inputType)
      input = [input]
    else
      throw new Error('`input` should be either string, array or object of dependency maps when presents')
  }

  if (Array.isArray(input) && 'number' === typeof input[0]) {
    var numberOfNulls = input[0]
    input = input.slice(1)
    while (numberOfNulls > 0) {
      numberOfNulls--
      input.unshift(null)
    }
  }

  return input
}

function normalizeOutput(output) {
  if ('string' === typeof output)
    output = [output]

  if (output && !Array.isArray(output))
    throw new Error('`output` should be either string or array of output names when presents')

  output = output || []

  // Detect any mapped output. Use the format `theOriginalName:theNewName` in
  // `output` array will map the output `theOriginalName` to `theNewName`.
  var i = 0
  var len = output.length
  var outputMap

  while (i < len) {
    var item = output[i++]
    if (/:/.test(item)) {
      outputMap = outputMap || {}
      var mapping = item.split(':')
      outputMap[mapping[0]] = mapping[1]
    }
  }

  return {
    output: output,
    outputMap: outputMap
  }
}
