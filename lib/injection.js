'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.subscribe = exports.provide = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.normalizeInputs = normalizeInputs;
exports.normalizeOutputs = normalizeOutputs;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Public API
 */

var provide = exports.provide = createInjector('provide');
var subscribe = exports.subscribe = createInjector('subscribe');

/**
 * Private functions
 */

function createInjector(type) {
  var wrapper = _defineProperty({}, type, function (WrappedComponent, inputs, outputs) {
    var typeofComponent = typeof WrappedComponent === 'undefined' ? 'undefined' : _typeof(WrappedComponent);
    if (typeofComponent === 'function') {
      var componentName = WrappedComponent.name;
      inputs = normalizeInputs(componentName, inputs, WrappedComponent.keys);
      outputs = normalizeOutputs(componentName, inputs, outputs);
      var creator = type === 'provide' ? createAlfaProvidedComponent : createAlfaSubscribedComponent;
      return creator(WrappedComponent, inputs, outputs, WrappedComponent.prototype && WrappedComponent.prototype.isReactComponent && 'component');
    } else {
      throw new TypeError('alfa.' + type + ' only accepts function or class.\n          Got "' + typeofComponent + '".');
    }
  });

  return wrapper[type];
}

function normalizeInputs(name, inputs, dynamicInputs) {
  if (inputs && ('string' === typeof inputs || (typeof inputs === 'undefined' ? 'undefined' : _typeof(inputs)) === 'object' && typeof inputs.alfaAction === 'function')) {
    return [inputs];
  } else if (Array.isArray(inputs)) {
    return inputs;
  } else if ('function' === typeof dynamicInputs) {
    return [];
  } else {
    throw new TypeError(name + ': provide/subscribe only accepts string or array\n     of strings as second parameter (inputs) when static property \'inputs\' of \n     component does not exist.');
  }
}

function normalizeOutputs(name, inputs, outputs) {
  // Check if output keys are provided when `set` is required as input key.
  if (Array.isArray(inputs) && inputs.indexOf('set') > -1 && (!Array.isArray(outputs) || 0 === outputs.length)) {
    throw new Error(name + ': outputs are required as 3rd argument of function \n"provide/subscribe" when "set" is provided/subscribed.');
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
    throw new TypeError(name + ': provide/subscribe only accepts string or array\n     of strings as 3rd parameter (outputs).');
  }
}

function createAlfaProvidedComponent(WrappedComponent, inputs, outputs, type) {
  // Keep the name of the orginal component which makes debugging logs easier
  // to understand.
  var componentName = WrappedComponent.name || 'AlfaProvidedComponent';

  var wrapper = _defineProperty({}, componentName, function (props, context, updater) {
    var injectedProps = getInjectedProps(inputs, outputs, context.alfaStore);
    // Props passed in directly to constructor has lower priority than inputs
    // injected from the store.
    var _props = _extends({}, props, injectedProps);

    var dynamicProps = getDynamicProps(WrappedComponent.keys, _props, outputs, context && context.alfaStore);

    // Dynamic props have higher priority than static props.
    if (dynamicProps) {
      _props = _extends({}, _props, dynamicProps.props);
    }

    if ('component' === type) {
      // Create an element if it's react component.
      return (0, _react.createElement)(WrappedComponent, _props);
    } else {
      // Otherwise, call the original function.
      return WrappedComponent(_props, context, updater);
    }
  });

  wrapper[componentName].contextTypes = {
    alfaStore: _propTypes2.default.object
  };

  if (WrappedComponent.keys) {
    wrapper[componentName].keys = WrappedComponent.keys;
  }

  return wrapper[componentName];
}

function createAlfaSubscribedComponent(WrappedComponent, inputs, outputs) {
  var _class, _temp;

  var classHolder = _defineProperty({}, WrappedComponent.name, (_temp = _class = function (_PureComponent) {
    _inherits(AlfaSubscribedComponent, _PureComponent);

    function AlfaSubscribedComponent(props, context, updater) {
      _classCallCheck(this, AlfaSubscribedComponent);

      var _this = _possibleConstructorReturn(this, (AlfaSubscribedComponent.__proto__ || Object.getPrototypeOf(AlfaSubscribedComponent)).call(this, props, context, updater));
      // Call the original constructor.


      var contextStore = context && context.alfaStore;

      // Get injected props which eventually will become state of the component.
      var injectedProps = getInjectedProps(inputs, outputs, contextStore);
      // Merge injected props with props where the first one has higher priority.
      var _props = _extends({}, props, injectedProps);

      // Get dynamic props.
      var dynamicProps = getDynamicProps(WrappedComponent.keys, _props, outputs, contextStore);

      // var maps
      if (dynamicProps) {
        _this.subKeys = [].concat(_toConsumableArray(inputs), _toConsumableArray(dynamicProps.inputs));
        _this.subMaps = dynamicProps.maps;
        _this.state = _extends({}, _props, dynamicProps.props);
      } else {
        _this.subKeys = inputs;
        _this.state = _props;
      }

      // Save the store for subscribe/unsubscribe.
      _this.store = contextStore;
      _this.subFunc = _this.setState.bind(_this);
      return _this;
    }

    _createClass(AlfaSubscribedComponent, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        // Call `setState` when subscribed keys changed.
        this.store.subscribe(this.subKeys, this.subFunc, this.subMaps);
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        'function' === typeof this.subFunc && this.store.unsubscribe(this.subFunc);
      }
    }, {
      key: 'render',
      value: function render() {
        return (0, _react.createElement)(WrappedComponent, this.state);
      }
    }]);

    return AlfaSubscribedComponent;
  }(_react.PureComponent), _class.contextTypes = {
    alfaStore: _propTypes2.default.object
  }, _temp));

  if (WrappedComponent.keys) {
    classHolder[WrappedComponent.name].keys = WrappedComponent.keys;
  }

  return classHolder[WrappedComponent.name];
}

function getInjectedProps(inputs, outputs, contextStore) {
  var stringInputs = inputs.filter(function (input) {
    return typeof input === 'string';
  });
  var injectedProps = _extends({}, contextStore.get(stringInputs));

  inputs.forEach(function (input) {
    if (input && (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object' && typeof input.alfaAction === 'function') {
      // Generate the final action function which can be called inside the
      // component.
      injectedProps[input.name] = input.alfaAction(contextStore);
    }
  });

  // Need to inject set.
  if (inputs.indexOf('set') > -1) {
    injectedProps.set = contextStore.setWithOutputs(outputs);
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
 * @param  {Object} contextStore
 * @return {Object}
 */
function getDynamicProps(inputs, props, outputs, contextStore) {
  var result;

  if (inputs && 'function' === typeof inputs) {
    var _keys = inputs(props);
    if (Array.isArray(_keys)) {
      // Array of input keys.  There's no mapping in this case.  Item in the
      // array is the name of the input key.  We use this array to get
      // dependencies directly from the store.
      result = {
        inputs: _keys,
        props: getInjectedProps(_keys, outputs, contextStore)
      };
    } else if (_keys && 'object' === (typeof _keys === 'undefined' ? 'undefined' : _typeof(_keys))) {
      // Object of mappings between injection keys and real input keys.
      var injectionKeys = Object.keys(_keys);
      var realInputs = injectionKeys.map(function (key) {
        return _keys[key];
      });
      var _props = getInjectedProps(realInputs, outputs, contextStore);
      var mappedProps = {};

      injectionKeys.forEach(function (key) {
        var realKey = _keys[key];
        mappedProps[key] = _props[realKey];
      });

      result = {
        maps: _keys,
        props: mappedProps,
        inputs: realInputs
      };
    }
  }

  // Map outputs
  if (outputs && 'function' === typeof props.set) {
    // The `set` of `props` which is obtained from calling
    // `contextStore.setWithOutputs(outputs)`
    var _setWithOutputs = props.set;
    var maps = result && result.maps;

    if (maps) {
      // Call `_setWithOutputs` with maps if
      props.set = function (key, value) {
        _setWithOutputs(key, value, maps);
      };
    }
  }

  return result;
}