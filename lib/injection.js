'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.subscribe = exports.inject = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.normalizeInputs = normalizeInputs;
exports.normalizeOutputs = normalizeOutputs;

var _isobject = require('isobject');

var _isobject2 = _interopRequireDefault(_isobject);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Public API
 */

var inject = exports.inject = createInjector('inject', createAlfaProvidedComponent);
var subscribe = exports.subscribe = createInjector('subscribe', createAlfaSubscribedComponent);

/**
 * Private functions
 */

function createInjector(type, creator) {
  return function (WrappedComponent, inputs, outputs) {
    /* istanbul ignore next */
    if (typeof WrappedComponent === 'function') {
      var componentName = WrappedComponent.name;
      inputs = normalizeInputs(componentName, inputs, WrappedComponent.keys);
      outputs = normalizeOutputs(componentName, inputs, outputs);
      return creator(WrappedComponent, inputs, outputs);
    } else {
      throw new TypeError('alfa.' + type + ' only accepts function or class. Got "' + (typeof WrappedComponent === 'undefined' ? 'undefined' : _typeof(WrappedComponent)) + '".');
    }
  };
}

function normalizeInputs(name, inputs, dynamicInputs) {
  if (inputs && ('string' === typeof inputs || (0, _isobject2.default)(inputs) &&
  /* istanbul ignore next */
  typeof inputs.alfaAction === 'function')) {
    return [inputs];
  } else if (Array.isArray(inputs)) {
    return inputs;
  } else if ('function' === typeof dynamicInputs) {
    return [];
  } else {
    throw new TypeError(name + ': inject/subscribe only accepts string or array of strings as second parameter (inputs) when static property \'keys\' of component does not exist.');
  }
}

function normalizeOutputs(name, inputs, outputs) {
  // Check if output keys are provided when `set` is required as input key.
  if (Array.isArray(inputs) && inputs.indexOf('set') > -1 && (!Array.isArray(outputs) || 0 === outputs.length)) {
    throw new Error(name + ': outputs are required as 3rd argument of function "inject/subscribe" when "set" is provided/subscribed.');
  }

  if (outputs) {
    // When we have key(s) of output we need to check the type(s) of all the keys.
    if ('string' === typeof outputs) {
      // The outputs is a string then normalize it as an array.
      return [outputs];
    }

    if (Array.isArray(outputs) && outputs.every(function (key) {
      return typeof key === 'string';
    })) {
      // Outputs is an array, make sure all the elements of this array are string.
      return outputs;
    }

    // Throw exception if any key of the outputs is not supported.
    throw new TypeError(name + ': inject/subscribe only accepts string or array of strings as 3rd parameter (outputs).');
  }
}

function createAlfaProvidedComponent(WrappedComponent, inputs, outputs) {
  var keys = WrappedComponent.keys;

  function AlfaProvidedComponent(props, context, updater) {
    var alfaStore = context && context.alfaStore;
    var injectedProps = getInjectedProps(inputs, outputs, alfaStore);
    // Props passed in directly to constructor has lower priority than inputs
    // injected from the store.
    var _props = _extends({}, props, injectedProps);
    var dynamicProps = getDynamicProps(keys, _props, outputs, alfaStore);
    // Dynamic props has higher priority than static props.
    if (dynamicProps) {
      _props = _extends({}, _props, dynamicProps.props);
    }

    if (WrappedComponent.prototype.isReactComponent) {
      // Create an element if it's react component.
      return (0, _react.createElement)(WrappedComponent, _props);
    } else {
      // Otherwise, call the original function.
      return WrappedComponent(_props, context, updater);
    }
  }

  AlfaProvidedComponent.keys = keys;
  AlfaProvidedComponent.contextTypes = {
    alfaStore: _propTypes2.default.object
  };

  return AlfaProvidedComponent;
}

function createAlfaSubscribedComponent(WrappedComponent, inputs, outputs) {
  var keys = WrappedComponent.keys;

  var AlfaSubscribedComponent = function (_Component) {
    _inherits(AlfaSubscribedComponent, _Component);

    function AlfaSubscribedComponent(props, context, updater) {
      _classCallCheck(this, AlfaSubscribedComponent);

      /* istanbul ignore next */
      var _this = _possibleConstructorReturn(this, (AlfaSubscribedComponent.__proto__ || Object.getPrototypeOf(AlfaSubscribedComponent)).call(this, props, context, updater));
      // Call the original constructor.


      var alfaStore = context && context.alfaStore;
      // Get injected props which eventually will become state of the component.
      var injectedProps = getInjectedProps(inputs, outputs, alfaStore);
      // Merge injected props with props where the first one has higher priority.
      var _props = _extends({}, props, injectedProps);
      // Get dynamic props.
      var dynamicProps = getDynamicProps(keys, _props, outputs, alfaStore);

      // Handle dymanic props.
      if (dynamicProps) {
        _this.subKeys = [].concat(_toConsumableArray(inputs), _toConsumableArray(dynamicProps.inputs));
        _this.subMaps = dynamicProps.maps;
        _this.state = _extends({}, _props, dynamicProps.props);
      } else {
        _this.subKeys = inputs;
        _this.state = _props;
      }

      // Save the store for subscribe/unsubscribe.
      _this.store = alfaStore;
      _this.setState = _this.setState.bind(_this);
      return _this;
    }

    _createClass(AlfaSubscribedComponent, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        // Call `setState` when subscribed keys changed.
        this.store.subscribe(this.subKeys, this.setState, this.subMaps);
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        // Unsubcribe `setState` when component is about to unmount.
        this.store.unsubscribe(this.setState);
      }
    }, {
      key: 'render',
      value: function render() {
        // Render the original component with state as its props.
        return (0, _react.createElement)(WrappedComponent, this.state);
      }
    }]);

    return AlfaSubscribedComponent;
  }(_react.Component);

  AlfaSubscribedComponent.contextTypes = {
    alfaStore: _propTypes2.default.object
  };


  AlfaSubscribedComponent.keys = keys;

  return AlfaSubscribedComponent;
}

function getInjectedProps(inputs, outputs, alfaStore) {
  var stringInputs = inputs.filter(function (input) {
    return typeof input === 'string';
  });
  var injectedProps = _extends({}, alfaStore.get(stringInputs));

  inputs.forEach(function (input) {
    if ((0, _isobject2.default)(input) &&
    /* istanbul ignore next */
    typeof input.alfaAction === 'function') {
      // Generate the final action function which can be called inside the
      // component.
      injectedProps[input.name] = input.alfaAction(alfaStore);
    }
  });

  // Need to inject set.
  if (inputs.indexOf('set') > -1) {
    injectedProps.set = alfaStore.setWithOutputs(outputs);
  }

  return injectedProps;
}

/**
 * Load dependencies with the result of calling `keys` function of the component.
 *
 * This gives people the ability to load dynamic dependencies based on the props
 * of the component at runtime.
 * It makes a map between the dynamic names of the dependencies and the names
 * of the properties injected in `state` of the component.
 * That helps maintaining a simple naming system in the application code.
 *
 * @param  {Function} keys
 * @param  {Object} props
 * @param  {Array} outputs
 * @param  {Object} alfaStore
 * @return {Object}
 */
function getDynamicProps(keys, props, outputs, alfaStore) {
  var result;

  if (keys && 'function' === typeof keys) {
    var _keys = keys(props);
    if (Array.isArray(_keys)) {
      // Array of input keys.  There's no mapping in this case.  Item in the
      // array is the name of the input key.  We use this array to get
      // dependencies directly from the store.
      result = {
        inputs: _keys,
        props: getInjectedProps(_keys, outputs, alfaStore)
      };
    } else if ((0, _isobject2.default)(_keys)) {
      // Object of mappings between injection keys and real input keys.
      var injectionKeys = Object.keys(_keys);
      var realInputs = injectionKeys.map(function (key) {
        return _keys[key];
      });
      var _props = getInjectedProps(realInputs, outputs, alfaStore);
      var mappedProps = {};
      injectionKeys.forEach(function (key) {
        return mappedProps[key] = _props[_keys[key]];
      });

      // Map outputs
      if (outputs && 'function' === typeof props.set) {
        // The `set` of `props` which is obtained from calling
        // `alfaStore.setWithOutputs(outputs)`
        var _setWithOutputs = props.set;
        // Call `_setWithOutputs` with maps if
        props.set = function (key, value) {
          _setWithOutputs(key, value, _keys);
        };
      }

      result = { maps: _keys, props: mappedProps, inputs: realInputs };
    }
  }

  return result;
}