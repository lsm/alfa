'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.createProvide = createProvide;
exports.createSubscribe = createSubscribe;

var _react = require('react');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Public API
 */

function createProvide(store) {
  return function provide(Component, keys) {
    if (isReactComponent(Component)) return createAlfaProvidedComponent(store, Component, keys);else return createAlfaProvidedFunction(store, Component, keys);
  };
}

function createSubscribe(store) {
  return function subscribe(Component, keys) {
    if (isReactComponent(Component)) return createAlfaSubscribedComponent(store, Component, keys, 'subscribe');else throw new Error('alfa.subscribe only accepts ReactComponent.');
  };
}

/**
 * Private functions
 */

function isReactComponent(Component) {
  return Component.prototype && Component.prototype.isReactComponent;
}

function createAlfaProvidedFunction(store, WrappedFunction, keys) {
  // Keep the name of the orginal function which makes debugging logs easier
  // to understand.
  var funcName = WrappedFunction.name || 'AlfaProvidedFunction';

  return _defineProperty({}, funcName, function (props, context, updater) {
    // Props passed in directly to constructor has higher priority than keys
    // injected from the store.
    // Note: We can certainly define and get a non-global store instance from 
    // context.  But, the question is - what are the benefits?
    props = _extends({}, store.get(keys), props || {});

    // Call the original function.
    return WrappedFunction(props, context, updater);
  })[funcName];
}

function createAlfaProvidedComponent(store, WrappedComponent, keys) {
  // Keep the name of the orginal component which makes debugging logs easier
  // to understand.
  var componentName = WrappedComponent.name || 'AlfaProvidedComponent';

  return _defineProperty({}, componentName, function (props) {
    var _props;
    // Props passed in directly to constructor has higher priority than keys
    // injected from the store.
    if (props) {
      _props = _extends({}, store.get(keys), props);
    } else {
      _props = store.get(keys);
    }

    return (0, _react.createElement)(WrappedComponent, _props);
  })[componentName];
}

function createAlfaSubscribedComponent(store, WrappedComponent, keys) {
  var subFunc;

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
      var _ret;

      _classCallCheck(this, AlfaSubscribedComponent);

      // State of parent constructor has higher priority than keys injected from
      // the store.
      var _this = _possibleConstructorReturn(this, (AlfaSubscribedComponent.__proto__ || Object.getPrototypeOf(AlfaSubscribedComponent)).call(this, props, context, updater));
      // Call the original constructor.


      var state = store.get(keys);
      if (_this.state) {
        _this.state = _extends({}, state, _this.state);
      } else {
        _this.state = state;
      }

      // Call `setState` when subscribed keys changed.
      if ('function' === typeof _this.setState) {
        subFunc = _this.setState.bind(_this);
        store.subscribe(keys, subFunc);
      }

      return _ret = _this, _possibleConstructorReturn(_this, _ret);
    }

    _createClass(AlfaSubscribedComponent, [{
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        'function' === typeof subFunc && store.unsubscribe(subFunc);
      }
    }, {
      key: 'render',
      value: function render() {
        var _props = _extends({}, this.props || {}, this.state);
        return (0, _react.createElement)(WrappedComponent, _props);
      }
    }]);

    return AlfaSubscribedComponent;
  }(_react.Component);

  return AlfaSubscribedComponent;
}