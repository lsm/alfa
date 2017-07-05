export const FN_WAIT = 'wait'
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

function normalizeStringInput(input, fnType) {
  if ('string' === typeof input)
    input = [input]

  if (!Array.isArray(input) || !input.every(item => 'string' === typeof item))
    throw new Error(`'${fnType}' pipe requires string or array of strings as input.`)

  return input
}

function createInputPipe(input) {
  input = normalizeStringInput(input)

  return {
    fn: function inputPipe(args, store, rawStore) {
      input.forEach((item, idx) => {
        if (item)
          rawStore[item] = args[idx]
      })
    },
    fnName: 'input'
  }
}

function createOutputPipe(input) {
  input = normalizeStringInput(input)

  return {
    fn: function outputPipe(args, store, rawStore) {
      input.forEach(key => {
        if (key)
          store.set(key, rawStore[key])
      })
    },
    fnName: 'output'
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
    fnName: 'wait'
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
    fnName: 'throttle'
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
  var pipe

  /**
   * A wrapper function to handle different types of pipe functions.
   * It calls the original function and return the result if that is a function. 
   * Or return the result directly for case like `boolean` value.
   */
  var fn = function() {
    var ofn = pipe.ofn
    var ofnType = typeof ofn
    if ('function' === ofnType) {
      // Call it with the arguments passed in when it's a function.
      // We call it with `0` to prevent some JS engines injecting the 
      // default `this`.
      var result = ofn.apply(0, Array.from(arguments))
      // When the result is boolean we will need to consider if it's a `not` 
      // pipe and alter the value based on that.
      if ('boolean' === typeof result)
        return pipe.not ? !result : result
      else
        return result
    } else if ('boolean' === ofnType) {
      // Directly return the value when it is a boolean for flow control.
      return pipe.not ? !ofn : ofn
    } else if (true === pipe.optional && 'undefined' === ofnType) {
      // Optional pipe which its function can not be found.
      // Return true to ignore and go next.
      return true
    } else {
      // Throw an exception when the original function is not something
      // we understand.
      throw new Error('Dependency `' + name + '` is not a function.')
    }
  }

  // Build the pipe.
  pipe = buildPipe(fn, input, output)

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
    fn: fn, // Original or wrapped function, should never be changed.
    ofn: fn, // The ofn property might be changed during pipeline execution for
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
  if ('string' === inputType)
    input = [input]

  if (input && !Array.isArray(input)) {
    if ('object' === inputType)
      input = [input]
    else
      throw new Error('`input` should be either string, array or object of dependency maps when presents')
  }

  return input
}

function normalizeOutput(output) {
  if ('string' === typeof output)
    output = [output]

  if (output && !Array.isArray(output))
    throw new Error('`output` should be either string or array of output names when presents')

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
