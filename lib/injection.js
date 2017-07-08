'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.createProvide = createProvide;
exports.createSubscribe = createSubscribe;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Public API
 */

function createProvide(store) {
  return function provide(WrappedComponent, keys) {
    if ('function' === typeof WrappedComponent) return createAlfaProvidedComponent(store, WrappedComponent, keys, isReactComponent(WrappedComponent) && 'component');else throw new Error('alfa.provide only accepts function or class.');
  };
}

function createSubscribe(store) {
  return function subscribe(WrappedComponent, keys) {
    if ('function' === typeof WrappedComponent) return createAlfaSubscribedComponent(store, WrappedComponent, keys);else throw new Error('alfa.subscribe only accepts function or class.');
  };
}

/**
 * Private functions
 */

function isReactComponent(Component) {
  return Component.prototype && Component.prototype.isReactComponent;
}

function createAlfaProvidedComponent(store, WrappedComponent, keys, type) {
  // Keep the name of the orginal component which makes debugging logs easier
  // to understand.
  var componentName = WrappedComponent.name || 'AlfaProvidedComponent';

  // Solution 1
  var wrapper = _defineProperty({}, componentName, function (props, context, updater) {
    // See if we have an alternative alfa store to use.
    store = context && context.alfaStore ? context.alfaStore : store;
    // Props passed in directly to constructor has higher priority than keys
    // injected from the store.
    props = _extends({}, store.get(keys), props || {});

    if ('component' === type)
      // Create an element if it's react component.
      return (0, _react.createElement)(WrappedComponent, props);else
      // Otherwise, call the original function.
      return WrappedFunction(props, context, updater);
  });

  wrapper[componentName].contextTypes = {
    alfaStore: _propTypes2.default.object
  };

  return wrapper[componentName];
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
      _classCallCheck(this, AlfaSubscribedComponent);

      // See if we have an alternative alfa store to use.
      var _this = _possibleConstructorReturn(this, (AlfaSubscribedComponent.__proto__ || Object.getPrototypeOf(AlfaSubscribedComponent)).call(this, props, context, updater));
      // Call the original constructor.


      store = context && context.alfaStore ? context.alfaStore : store;

      // Inject all keys as state.
      _this.state = store.get(keys);

      // Call `setState` when subscribed keys changed.
      if ('function' === typeof _this.setState) {
        // Make sure we use the correct store for unsubscribe.
        _this.store = store;
        subFunc = _this.setState.bind(_this);
        store.subscribe(keys, subFunc);
      }
      return _this;
    }

    _createClass(AlfaSubscribedComponent, [{
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        'function' === typeof subFunc && this.store.unsubscribe(subFunc);
      }
    }, {
      key: 'render',
      value: function render() {
        // State injected may change during normal component lifecycle.
        // So in this case it has higher priority than props.
        var _props = _extends({}, this.props || {}, this.state);

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