'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStore = exports.subscribe = exports.provide = exports.action = exports.set = exports.get = undefined;

var _store = require('./store');

Object.defineProperty(exports, 'createStore', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_store).default;
  }
});

var _store2 = _interopRequireDefault(_store);

var _action = require('./action');

var _action2 = _interopRequireDefault(_action);

var _injection = require('./injection');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createAlfa() {
  function alfa() {
    return createAlfa();
  }

  var store = (0, _store2.default)();

  alfa.get = store.get;
  alfa.set = store.set;
  alfa.action = (0, _action2.default)(store);
  alfa.provide = (0, _injection.createProvide)(store);
  alfa.subscribe = (0, _injection.createSubscribe)(store);

  return alfa;
}

/**
 * Default global instance of alfa.
 * @type {Function}
 */
var alfa = createAlfa();

/**
 * Export toplevel APIs.
 */
exports.default = alfa;
var get = exports.get = alfa.get;
var set = exports.set = alfa.set;
var action = exports.action = alfa.action;
var provide = exports.provide = alfa.provide;
var subscribe = exports.subscribe = alfa.subscribe;