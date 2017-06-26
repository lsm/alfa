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
export default function createPipe(pipeline, fn, input, output) {
  var fnType = typeof fn

  if ('number' === fnType) {
    return createThrottlePipe(fn)
  } else if ('string' === fnType) {
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
  } else if (true === fn.instanceOfAlfaPipeline) {
    fn = fn.toPipe(pipeline.getInjector())
  }

  return buildPipe(fn, input, output)
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
    }
  }
}

function createOutputPipe(input) {
  input = normalizeStringInput(input)

  return {
    fn: function outputPipe(args, store, rawStore) {
      const output = {}
      input.forEach(item => {
        if (item)
          output[item] = rawStore[item]
      })
      store.set(output)
    }
  }
}

function createWaitPipe(msec) {
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
    }
  }
}


function createInjectionPipe(name, input, output) {
  var pipe
  var fn = function() {
    var ofn = pipe.ofn
    var ofnType = typeof ofn
    if ('function' === ofnType) {
      // when it's a function call it with rest of the arguments
      var result = ofn.apply(this, Array.from(arguments))
      if ('boolean' === typeof result)
        return pipe.not ? !result : result
      else
        return result
    } else if ('boolean' === ofnType) {
      // directly return the value when it is a boolean for flow control
      return pipe.not ? !ofn : ofn
    } else if (true === pipe.optional && 'undefined' === ofnType) {
      // Optional pipe which pipe function can not be found.
      // Return true to ignore and go next.
      return true
    } else {
      throw new Error('Dependency `' + name + '` is not a function.')
    }
  }

  // Build the pipe.
  pipe = buildPipe(fn, input, output)

  if (/^!/.test(name)) {
    pipe.not = true
    name = name.slice(1)
  }

  if (/\?$/.test(name)) {
    // Optional pipe if function name ends with question mark.
    pipe.optional = true
    // Remove the trailing question mark.
    name = name.slice(0, -1)
  }

  if ('set' === name) {
    // a `set` pipe function with customized position based output
    var _output = pipe.output
    if (_output && (!input || 'number' === typeof input || isArray(input))) {
      pipe.fn = function() {
        var args
        var positioned
        if (1 === arguments.length
          && (!input || 1 === input)
          && 'object' === typeof arguments[0]
          && !isArray(arguments[0])) {
          args = arguments[0]
        } else {
          args = arguments
          positioned = true
        }

        var result = {}
        foreach(_output, function(supplyName, idx) {
          result[supplyName] = positioned ? args[idx] : args[supplyName]
        })
        return result
      }
    } else if ('object' === typeof input && !isArray(input)) {
      // mapped dependencies by position of output
      pipe.input = null
      pipe.fn = function() {
        var args = arguments
        var result = {}
        // `value` is index of arguments
        // `key` is name of supply
        foreach(input, function(value, key) {
          result[key] = args[value]
        })
        return result
      }
    }
  }

  // Set the original function name to the pipe object for later dependency discovery.
  pipe.fnName = name
  return pipe
}

/**
 * The actual function for building a pipe.
 *
 * @param  {Function} fn
 *         - Function: The pipe function
 *         - String: Name of function which could be found in dependencies.
 *         - Number: Number of miliseconds to throttle the pipeline.
 *         - Array: A array which contains both `fn` (first) and `deps` (rest).
 * @param  {Array|String}   deps... String or array of names of dependencies.
 * @return {Object}         An object contains dependencies injected function and deps.
 */
function buildPipe(fn, deps, supplies) {
  if ('function' !== typeof fn)
    throw new Error('fn should be a function, got ' + typeof fn)

  var depsType = typeof deps
  if ('string' === depsType || 'number' === depsType)
    deps = [deps]

  if ('string' === typeof supplies)
    supplies = [supplies]

  if (deps && !isArray(deps)) {
    if ('object' === depsType)
      deps = [deps]
    else
      throw new Error('`dependencies` should be either string, array or object of dependency names if present')
  }

  if (supplies && !isArray(supplies))
    throw new Error('supplies should be either string or array of dependency names if present')

  // If first dependency is a number it tells us the number of original function
  // arguments we need to pass for calling the pipe function.
  if (deps) {
    var firstDep = deps[0]
    if ('number' === typeof firstDep && 0 < firstDep) {
      deps[0] = null
      while (1 < firstDep) {
        deps.unshift(null)
        firstDep--
      }
    }
  }

  // Detect any mapped supplies. Use the format `theOriginalName:theNewName` in
  // `supplies` array would cause the `setDep('theOriginalName', obj)` to actually
  // set the dependency equals calling `setDep('theNewName', obj)` hence mapped
  // the dependency name.
  var setDepMap
  foreach(supplies, function(supply) {
    if (/:/.test(supply)) {
      setDepMap = setDepMap || {}
      var mapping = supply.split(':')
      setDepMap[mapping[0]] = mapping[1]
    }
  })

  // Return pipe object with function and its metadata.
  return {
    fn: fn, // Original or wrapped function, should be never changed.
    ofn: fn, // The ofn property might be changed during pipeline execution for
    // loading/generating pipe functions dynamically.
    deps: deps,
    fnName: getFnName(fn),
    supplies: supplies,
    setDepMap: setDepMap
  }
}
