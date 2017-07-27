'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = createPipeline;

var _executor = require('./executor');

var _store = require('./store');

var _builder = require('./builder');

function createPipeline(name, store, definitions) {
  /**
   * Internal array which holds all the normalized pipes.
   * @type {Array}
   */
  var _pipes;

  /**
   * Instance of pipeline.  It takes an optional instance of store and return
   * a function which could trigger the execution of the pipeline.
   *
   * @param {Object|undefined} theStore Instance of alfa store.  Default store
   *                                    will be used if it's not provided.
   */
  function pipeline(theStore, theRawStore, callback) {
    theStore = theStore || store;

    /**
     * This is the function will be called by end user.  It triggers the 
     * execution of the pipeline.
     */
    function execPipeline() {
      // Do nothing where there's no pipe at all.
      if (0 === _pipes.length) return;

      /**
       * Start from the first pipe of the pipeline.
       * @type {Number}
       */
      var step = 0;

      /**
       * Convert original function arguments to array.
       * 
       * @type {Array}
       */
      var _args = Array.from(arguments);

      /**
       * Make a shallow clone of the key/value store.
       * 
       * @type {Object}
       */
      var _rawStore = theRawStore || theStore.clone();

      /**
       * The `set` function can only modified the cloned raw store and will
       * not trigger any listening functions.
       *  
       * @param {String|Object}   key   Name of the value in store.  Or object of
       * key/value pairs to merge into the store. 
       * @param {Any}             value Value to save.
       */
      _rawStore.set = function (key, value) {
        (0, _store.setRawStore)(_rawStore, key, value);
      };

      var previousPipeState;

      /**
       * The function which helps executing functions in the pipeline one by one.
       * 
       * @param  {Object|null}    err   Error object if any.
       * @param  {String|Object}  key   Key of value to store or object of 
       *                                key/value maps.
       * @param  {Any}            value Value to store.
       */
      var next = function next(err, key, value) {
        if (previousPipeState && arguments.length > 1) {
          // `next` could be called before the return of previous pipe so we need
          // to set the `autoNext` flag of previous pipe state to false to avoid
          // `double next`.
          previousPipeState.autoNext = false;

          // We have more than one argument which means the previous pipe produced
          // some output by calling `next`.  We need to merge this output with 
          // rawStore before executing the next pipe.
          (0, _store.setRawStore)(_rawStore, key, value);
        }

        // Save error to the raw store or get one from it.  This will make sure 
        // error will be handled properly no matter how it was set.
        if (err) _rawStore.error = err;else err = _rawStore.error;

        var pipe;

        if (err) {
          // Throw the error if we don't have error handling function.
          if (!pipeline.errorPipe) {
            var fnName = previousPipeState && previousPipeState.fnName;
            fnName = fnName || previousPipeState.fn.name || 'function';
            throwError(err, name, step, fnName);
          }

          pipe = pipeline.errorPipe;
        } else {
          // Get current pipe and add 1 to the step.
          pipe = _pipes[step++];
        }

        if (pipe) {
          /**
           * Object for holding execution state, result and other references
           * of certain pipe for executing pipeline continously.
           * 
           * @type {Object}
           */
          var pipeState = _extends({}, pipe, {
            next: next,
            result: undefined,
            fnReturned: false

            /**
             * Keep a reference to pipeState for better error handling.
             * @type {Object}
             */
          });previousPipeState = pipeState;

          // Excute the pipe.
          (0, _executor.executePipe)(err, _args, theStore, _rawStore, pipeState);
        } else if (callback) {
          // No more pipes, let's call the `callback` to indicate the pipeline
          // has done exection if it's provided.
          callback(err);
        }
      };

      // Save next to the raw store so pipes could retrieve it as input.
      _rawStore.next = next;

      // Start executing the chain
      next();
    }

    return execPipeline;
  }

  pipeline.isAlfaPipeline = true;

  if (definitions) {
    _pipes = [];
    definitions.forEach(function (pipeDef) {
      var _pipe = (0, _builder.createPipe)(pipeDef[0], pipeDef[1], pipeDef[2]);
      if (_builder.FN_ERROR === _pipe.fnName) pipeline.errorPipe = _pipe;else _pipes.push(_pipe);
    });
  } else {
    _pipes = attachPipelineFunctions(pipeline);
  }

  return pipeline;
}

/**
 * Pipeline instance functions
 */

function attachPipelineFunctions(pipeline) {
  var pipes = [];

  pipeline.input = function (input) {
    var p = (0, _builder.createPipe)(_builder.FN_INPUT, input);
    pipes.push(p);
    return pipeline;
  };

  pipeline.pipe = function (fn, input, output) {
    if ('error' === fn) return pipeline.error(input, output);

    var p = (0, _builder.createPipe)(fn, input, output);
    pipes.push(p);
    return pipeline;
  };

  pipeline.error = function (fn, input) {
    pipeline.errorPipe = (0, _builder.createPipe)(_builder.FN_ERROR, fn, input);
    return pipeline;
  };

  pipeline.wait = function (input) {
    var p = (0, _builder.createPipe)(_builder.FN_WAIT, input);
    pipes.push(p);
    return pipeline;
  };

  pipeline.output = function (input) {
    var p = (0, _builder.createPipe)(_builder.FN_OUTPUT, input);
    pipes.push(p);
    return pipeline;
  };

  pipeline.throttle = function (input) {
    var p = (0, _builder.createPipe)(_builder.FN_THROTTLE, input);
    pipes.push(p);
    return pipeline;
  };

  return pipes;
}

function throwError(error, name, step, pipe) {
  var ex = error;

  if ('string' === typeof error) {
    ex = new Error();
    ex.name = 'Pipeline "' + name + '" error in step "' + step + ':' + pipe + '":\n    \n(use .pipe("error", errorHandlerFn, [\'input\']) to handle this error inside your pipeline.)';
    ex.message = error;
  }

  throw ex;
}