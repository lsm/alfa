import { isPlainObject } from './store'


export function executePipe(err, args, store, rawStore, pipeState) {
  var fn = pipeState.fn
  var next = pipeState.next
  var input = pipeState.input
  var output = pipeState.output
  var fnName = pipeState.fnName
  var _inputArgs
  var injectedFn

  if (!input || !(input.length > 0)) {
    _inputArgs = args
  } else {
    _inputArgs = input.map((key, idx) => {
      if (!key)
        return args[idx]
      else
        return rawStore[key]
    })
  }

  // Get the pipe function demanded from dependency container.
  if ('string' === typeof fnName) {
    // Set it as the original pipe function
    injectedFn = rawStore[fnName]
    if (pipeState.optional) {
      // Optional pipe, go next if any of the dependencies is undefined.
      if (-1 < _inputArgs.indexOf(undefined)) {
        next()
        return
      }
    }
  }

  var modifiedSet
  if (output && 0 < output.length) {
    if (true === pipeState.autoNext) {
      // Only track output when autoNext is true.
      pipeState.fulfilled = []
      // We will handle the auto next behaviour in setWithPipeState function.
      pipeState.autoNext = false
    }
    modifiedSet = function(key, value) {
      setWithPipeState(rawStore, pipeState, key, value)
    }

    // Call customized set function instead.
    if (input.indexOf('set') > -1) {
      input.forEach(function(key, idx) {
        if ('set' === key)
          _inputArgs[idx] = modifiedSet
      })
    }
  }

  if ('input' === fnName || 'output' === fnName)
    pipeState.result = fn.call(0, args, store, rawStore)
  else if (injectedFn)
    pipeState.result = executeInjectedFunc(_inputArgs, injectedFn, pipeState)
  else
    pipeState.result = fn.apply(0, _inputArgs)

  pipeState.fnReturned = true

  // Call setDep if a plain object was returned
  if (isPlainObject(pipeState.result))
    (modifiedSet || rawStore.set)(pipeState.result)

  // Check if we need to run next automatically when:
  // 1. result is true
  // 2. autoNext is true and no error and result is not false
  if (true === pipeState.result || (pipeState.autoNext && !err && false !== pipeState.result))
    next()
}


export function setWithPipeState(rawStore, pipeState, key, value) {
  var next = pipeState.next
  var result = pipeState.result
  var output = pipeState.output
  var outputMap = pipeState.outputMap
  var fulfilled = pipeState.fulfilled
  var fnReturned = pipeState.fnReturned

  // Error happens in previous `set` call return to avoid call error handler twice.
  if (pipeState.hasError)
    return

  var keyType = typeof key
  if ('string' === typeof key) {
    let checkName = key
    let mappedName = outputMap && outputMap[key]
    if (mappedName) {
      // Check against the mapping name
      checkName = key + ':' + mappedName
      // Set the mappedName as the real dependency name
      key = mappedName
    }
    checkFulfillment(checkName, pipeState, output, fulfilled)
    rawStore.set(key, value)
  } else if (isPlainObject(key)) {
    Object.keys(key).forEach(function(propName) {
      var nameTOCheck = propName
      var mappedName = outputMap && outputMap[propName]
      if (mappedName) {
        // Check against the mapping name
        nameTOCheck = propName + ':' + mappedName
        // Set the original propName to mappedName so we set `mappedName` as
        // depenency name instead of `propName`
        propName = mappedName
      }
      checkFulfillment(nameTOCheck, pipeState, output, fulfilled)
      rawStore.set(propName, key[propName])
    })
  } else {
    throw new Error(`Unsupported arguments type "${keyType}" for "set".`)
  }

  // Call next immediately if there is an error
  if (pipeState.hasError) {
    pipeState.autoNext = false
    next()
  } else if (fulfilled) {
    if (fulfilled.length === output.length) {
      // Set the auto next to true or call next when all required
      // supplies are fulfilled.
      if (fnReturned && ('undefined' === typeof result || false !== result))
        // Function has been returned.
        // We should call next when the returned value is either
        // undefined or not false.
        next()
      else
        // `setWithPipeState` will only be called when autoNext was true 
        // so set it back to true when we are not sure what to do and 
        // let other part of the code to handle when to call next.
        pipeState.autoNext = true
    } else if (fulfilled.length > output.length) {
      throw new Error('Got more output than what it is required.')
    }
  }
}


function checkFulfillment(key, pipeState, output, fulfilled) {
  if ('error' === key)
    pipeState.hasError = true
  else if (-1 === output.indexOf(key))
    throw new Error(`Dependency "${key}" is not defined in output.`)
  if (fulfilled && -1 === fulfilled.indexOf(key))
    fulfilled.push(key)
}

/**
 * A function to handle different types of pipe functions.
 * It calls the original function and return the result if that is a function. 
 * Or return the result directly for case like `boolean` value.
 */
function executeInjectedFunc(args, injectedFn, pipeState) {
  var injectedFnType = typeof injectedFn
  if ('function' === injectedFnType) {
    // Call it with the arguments passed in when it's a function.
    // We call it with `0` to prevent some JS engines injecting the 
    // default `this`.
    var result = injectedFn.apply(0, args)
    // When the result is boolean we will need to consider if it's a `not` 
    // pipe and alter the value based on that.
    if ('boolean' === typeof result)
      return pipeState.not ? !result : result
    else
      return result
  } else if ('boolean' === injectedFnType) {
    // Directly return the value when it is a boolean for flow control.
    return pipeState.not ? !injectedFn : injectedFn
  } else if (true === pipeState.optional && 'undefined' === injectedFnType) {
    // Optional pipe which its function can not be found.
    // Return true to ignore and go next.
    return true
  } else {
    // Throw an exception when the original function is not something
    // we understand.
    throw new Error(`Dependency ${pipeState.fnName} is not a function.`)
  }
}
