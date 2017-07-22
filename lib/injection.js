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
  return function provide(WrappedComponent, keys) {
    if ('function' === typeof WrappedComponent) {
      keys = normalizeKeys(keys, 'provide', WrappedComponent.keys);
      return createAlfaProvidedComponent(store, WrappedComponent, keys, isReactComponent(WrappedComponent) && 'component');
    } else {
      throw new TypeError('alfa.provide only accepts function or class.');
    }
  };
}

function createSubscribe(store) {
  return function subscribe(WrappedComponent, keys) {
    if ('function' === typeof WrappedComponent) {
      keys = normalizeKeys(keys, 'subscribe', WrappedComponent.keys);
      return createAlfaSubscribedComponent(store, WrappedComponent, keys);
    } else {
      throw new TypeError('alfa.subscribe only accepts function or class.');
    }
  };
}

/**
 * Private functions
 */

function normalizeKeys(keys, name, dynamicKeys) {
  if ('string' === typeof keys) return [keys];else if (Array.isArray(keys)) return keys;else if ('function' === typeof dynamicKeys) return [];else throw new TypeError('"' + name + '" only accepts string or array of strings as second parameter.');
}

function isReactComponent(Component) {
  return Component.prototype && Component.prototype.isReactComponent;
}

function createAlfaProvidedComponent(store, WrappedComponent, keys, type) {
  // Keep the name of the orginal component which makes debugging logs easier
  // to understand.
  var componentName = WrappedComponent.name || 'AlfaProvidedComponent';

  var wrapper = _defineProperty({}, componentName, function (props, context, updater) {
    var injectedProps = getInjectedProps(keys, store, context && context.alfaStore);
    // Props passed in directly to constructor has lower priority than keys
    // injected from the store.
    var _props = _extends({}, props, injectedProps);

    var dynamicProps = getDynamicProps(WrappedComponent.keys, _props, store, context && context.alfaStore);
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

  return wrapper[componentName];
}

function createAlfaSubscribedComponent(store, WrappedComponent, keys) {
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

      // Get dynamic props.
      var dynamicProps = getDynamicProps(WrappedComponent.keys, _extends({}, props, state), store, context && context.alfaStore);

      // var maps
      if (dynamicProps) {
        _this.subKeys = [].concat(_toConsumableArray(keys), _toConsumableArray(dynamicProps.keys));
        _this.subMaps = dynamicProps.maps;
        _this.state = _extends({}, state, dynamicProps.props);
      } else {
        _this.subKeys = keys;
        _this.state = state;
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
        // State injected may change during normal component lifecycle.
        // So in this case it has higher priority than props.
        var _props = _extends({}, this.props, this.state);

        // State and props are merged and passed to wrapped component as props.
        return (0, _react.createElement)(WrappedComponent, _props);
      }
    }]);

    return AlfaSubscribedComponent;
  }(_react.Component);

  AlfaSubscribedComponent.contextTypes = {
    alfaStore: _propTypes2.default.object
  };


  return AlfaSubscribedComponent;
}

function getInjectedProps(keys, store, contextStore) {
  var injectedProps = _extends({}, store.get(keys), contextStore ? contextStore.get(keys) : undefined);

  // Need to inject set.
  if (keys.indexOf('set') > -1) injectedProps.set = (contextStore || store).set;

  Object.keys(injectedProps).forEach(function (key) {
    var prop = injectedProps[key];
    if ('function' === typeof prop && true === prop.instanceOfAlfaPipeline) injectedProps[key] = prop(contextStore || store);
  });

  return injectedProps;
}

function getDynamicProps(keys, props, store, contextStore) {
  if (keys && 'function' === typeof keys) {
    var _keys = keys(props);
    if (Array.isArray(_keys)) {
      return {
        keys: _keys,
        props: getInjectedProps(_keys, store, contextStore)
      };
    } else if (_keys && 'object' === (typeof _keys === 'undefined' ? 'undefined' : _typeof(_keys))) {
      var injectionKeys = Object.keys(_keys);
      var realkeys = injectionKeys.map(function (key) {
        return _keys[key];
      });
      var _props = getInjectedProps(realkeys, store, contextStore);
      var result = {};

      injectionKeys.forEach(function (key) {
        var realKey = _keys[key];
        result[key] = _props[realKey];
      });

      return {
        keys: realkeys,
        maps: _keys,
        props: result
      };
    }
  }
}