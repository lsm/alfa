'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = app;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Wrap an component with alfa store.
 *
 * @param  {Class|Function}     WrappedComponent The user component which is being wrapped.
 * @param  {Store|Object|null}  data            This could be several types:
 *    1. Instance of alfa Store which will be used directly as the internal store object.
 *    2. The initial data of the private store if it's an plain object.
 *    3. Nothing.  A private store will be created internally.
 * @return {Class}              The wrapping component.
 */
function app(WrappedComponent, data) {
  var store;

  // Handle different type of data.
  if (data) {
    store = data.isAlfaStore ? data : new _store2.default(data);
  } else {
    store = new _store2.default();
  }

  // Wrap the component with instance of alfa store as a context.

  var App = function (_Component) {
    _inherits(App, _Component);

    // eslint-disable-next-line
    function App(props) {
      _classCallCheck(this, App);

      /* istanbul ignore next */
      return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));
    }

    _createClass(App, [{
      key: 'getChildContext',
      value: function getChildContext() {
        return {
          alfaStore: store
        };
      }
    }, {
      key: 'render',
      value: function render() {
        return (0, _react.createElement)(WrappedComponent, this.props);
      }
    }]);

    return App;
  }(_react.Component);

  App.childContextTypes = {
    alfaStore: _propTypes2.default.object
  };


  return App;
}