'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.createProvide = createProvide;
exports.createSubscribe = createSubscribe;

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

function createProvide(store) {
  return function provide(WrappedComponent, keys, output) {
    if ('function' === typeof WrappedComponent) {
      var componentName = WrappedComponent.name;
      keys = normalizeKeys(componentName, keys, WrappedComponent.keys);
      checkOutput(componentName, keys, output);
      return createAlfaProvidedComponent(store, WrappedComponent, keys, output, isReactComponent(WrappedComponent) && 'component');
    } else {
      throw new TypeError('alfa.provide only accepts function or class.');
    }
  };
}

function createSubscribe(store) {
  return function subscribe(WrappedComponent, keys, output) {
    if ('function' === typeof WrappedComponent) {
      var componentName = WrappedComponent.name;
      keys = normalizeKeys(componentName, keys, WrappedComponent.keys);
      checkOutput(componentName, keys, output);
      return createAlfaSubscribedComponent(store, WrappedComponent, keys, output);
    } else {
      throw new TypeError('alfa.subscribe only accepts function or class.');
    }
  };
}

/**
 * Private functions
 */

function normalizeKeys(name, keys, dynamicKeys) {
  if ('string' === typeof keys) {
    return [keys];
  } else if (Array.isArray(keys)) {
    return keys;
  } else if ('function' === typeof dynamicKeys) {
    return [];
  } else {
    throw new TypeError(name + ': provide/subscribe only accepts string or array\n     of strings as second parameter when static property \'keys\' of component\n     does not exist.');
  }
}

function checkOutput(name, keys, output) {
  if (Array.isArray(keys)) {
    if (keys.indexOf('set') > -1 && (!Array.isArray(output) || 0 === output.length)) {
      throw new Error(name + ': array of output keys should be provided as 3rd\nargument of function "provide/subscribe" when "set" is provided/subscribed.');
    }
  }
}

function isReactComponent(Component) {
  return Component.prototype && Component.prototype.isReactComponent;
}

function createAlfaProvidedComponent(store, WrappedComponent, keys, output, type) {
  // Keep the name of the orginal component which makes debugging logs easier
  // to understand.
  var componentName = WrappedComponent.name || 'AlfaProvidedComponent';

  var wrapper = _defineProperty({}, componentName, function (props, context, updater) {
    var injectedProps = getInjectedProps(keys, store, context && context.alfaStore);
    // Props passed in directly to constructor has lower priority than keys
    // injected from the store.
    var _props = _extends({}, props, injectedProps);

    var dynamicProps = getDynamicProps(WrappedComponent.keys, _props, output, store, context && context.alfaStore);
    if (dynamicProps) {
      _props = _extends({}, _props, dynamicProps.props);
    }

    if ('component' === type)
      // Create an element if it's react component.
      return (0, _react.createElement)(WrappedComponent, _props);else
      // Otherwise, call the original function.
      return WrappedComponent(_props, context, updater);
  });

  wrapper[componentName].contextTypes = {
    alfaStore: _propTypes2.default.object
  };

  if (WrappedComponent.keys) wrapper[componentName].keys = WrappedComponent.keys;

  return wrapper[componentName];
}

function createAlfaSubscribedComponent(store, WrappedComponent, keys, output) {
  var AlfaSubscribedComponent = function (_Component) {
    _inherits(AlfaSubscribedComponent, _Component);

    _createClass(AlfaSubscribedComponent, null, [{
      key: 'name',

      // Keep the name of the orginal component which makes debugging logs easier
      // to understand.
      get: function get() {
        return WrappedComponent.name;
      }
    }]);

    function AlfaSubscribedComponent(props, context, updater) {
      _classCallCheck(this, AlfaSubscribedComponent);

      // Inject all keys as state.
      var _this = _possibleConstructorReturn(this, (AlfaSubscribedComponent.__proto__ || Object.getPrototypeOf(AlfaSubscribedComponent)).call(this, props, context, updater));
      // Call the original constructor.


      var contextStore = context && context.alfaStore;
      var state = getInjectedProps(keys, store, contextStore);
      var _props = _extends({}, props, state);

      // Get dynamic props.
      var dynamicProps = getDynamicProps(WrappedComponent.keys, _props, output, store, context && context.alfaStore);

      // var maps
      if (dynamicProps) {
        _this.subKeys = [].concat(_toConsumableArray(keys), _toConsumableArray(dynamicProps.keys));
        _this.subMaps = dynamicProps.maps;
        _this.state = _extends({}, _props, dynamicProps.props);
      } else {
        _this.subKeys = keys;
        _this.state = _props;
      }

      // Use the correct store for subscribe/unsubscribe.
      _this.store = contextStore || store;
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
        // State and props are merged and passed to wrapped component as props.
        return (0, _react.createElement)(WrappedComponent, this.state);
      }
    }]);

    return AlfaSubscribedComponent;
  }(_react.Component);

  AlfaSubscribedComponent.contextTypes = {
    alfaStore: _propTypes2.default.object
  };


  if (WrappedComponent.keys) AlfaSubscribedComponent.keys = WrappedComponent.keys;

  return AlfaSubscribedComponent;
}

function getInjectedProps(keys, store, contextStore) {
  var injectedProps = _extends({}, store.get(keys), contextStore ? contextStore.get(keys) : undefined);

  // Need to inject set.
  if (keys.indexOf('set') > -1) injectedProps.set = (contextStore || store).set;

  Object.keys(injectedProps).forEach(function (key) {
    var prop = injectedProps[key];
    if ('function' === typeof prop && true === prop.isAlfaPipeline) injectedProps[key] = prop(contextStore || store);
  });

  return injectedProps;
}

function getDynamicProps(keys, props, output, store, contextStore) {
  var result;
  if (keys && 'function' === typeof keys) {
    var _keys = keys(props);
    if (Array.isArray(_keys)) {
      result = {
        keys: _keys,
        props: getInjectedProps(_keys, store, contextStore)
      };
    } else if (_keys && 'object' === (typeof _keys === 'undefined' ? 'undefined' : _typeof(_keys))) {
      var injectionKeys = Object.keys(_keys);
      var realkeys = injectionKeys.map(function (key) {
        return _keys[key];
      });
      var _props = getInjectedProps(realkeys, store, contextStore);
      var mappedProps = {};

      injectionKeys.forEach(function (key) {
        var realKey = _keys[key];
        mappedProps[key] = _props[realKey];
      });

      result = {
        keys: realkeys,
        maps: _keys,
        props: mappedProps
      };
    }
  }

  // Map and check output
  if (output && 'function' === typeof props.set) {
    var _set = props.set;
    var maps = result && result.maps;
    props.set = function (key, value) {
      // The output key is a dynamic key.  Set with its real key.
      if (maps && maps[key]) {
        key = maps[key];
      } else if (-1 === output.indexOf(key)) {
        // Check if the output key is allowed.
        throw new Error('Output key "' + key + '" is not allowed.  You need to\n              defined it as an output when calling provide/subscribe.');
      }

      _set(key, value);
    };
  }

  return result;
}