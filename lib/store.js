'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _isobject = require('isobject');

var _isobject2 = _interopRequireDefault(_isobject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The Store class. It's a key value store with simple subscription support.
 */
var Store = function () {
  /**
   * Constructor
   */
  function Store(data) {
    var _this = this;

    _classCallCheck(this, Store);

    this.isAlfaStore = true;

    this.setWithOutputs = function (outputs) {
      var set = _this.set;

      return function checkOutputAndSet(key, value, maps) {
        if ((0, _isobject2.default)(key)) {
          Object.keys(key).forEach(function (_key) {
            checkOutputAndSet(_key, key[_key], maps);
          });
          return;
        }

        if (outputs && outputs.indexOf(key) === -1) {
          // Throw exception if the output key is not allowed.
          throw new Error('Output key "' + key + '" is not allowed. You need to define it as an output when calling provide/subscribe.');
        }

        if (maps && maps[key]) {
          key = maps[key];
        }

        set(key, value);
      };
    };

    this.clone = function () {
      var cloned = {};
      var _store = _this._store;

      Object.keys(_store).forEach(function (key) {
        return cloned[key] = _store[key];
      });
      return cloned;
    };

    this.subscribe = function (keys, fn, maps) {
      if ('function' !== typeof fn) {
        throw new TypeError('`fn` must be a function');
      }

      if (maps) {
        fn.maps = maps;
      }

      var _subscriptions = _this._subscriptions;


      Array.isArray(keys) && keys.forEach(function (key) {
        var subs = _subscriptions[key];
        if (Array.isArray(subs)) {
          subs.indexOf(key) === -1 && subs.push(fn);
        } else {
          _subscriptions[key] = [fn];
          return;
        }
      });
    };

    this.unsubscribe = function (fn) {
      var _subscriptions = _this._subscriptions;

      Object.keys(_subscriptions).forEach(function (key) {
        var subs = _subscriptions[key];
        subs && (_subscriptions[key] = subs.filter(function (f) {
          return f !== fn;
        }));
      });
    };

    /**
     * Internal object which holds the key/value map.
     * @type {Object}
     */
    this._store = _extends({}, data);

    /**
     * Internal object which holds all the subscription functions.
     * @type {Object}
     */
    this._subscriptions = {};

    this.set = this.set.bind(this);
  }

  /**
   * @type {Boolean}
   */


  _createClass(Store, [{
    key: 'get',


    /**
     * Get value from store by key.
     *
     * @param  {String|undefined} key Name of the value to get.
     * @return {Any}        Value.
     */
    value: function get(key) {
      var keyType = typeof key === 'undefined' ? 'undefined' : _typeof(key);
      var _store = this._store;

      if ('string' === keyType) {
        return _store[key];
      } else if (Array.isArray(key) && key.length > 0) {
        var results = {};
        key.forEach(function (k) {
          if ('string' === typeof k) {
            if (_store.hasOwnProperty(k)) {
              results[k] = _store[k];
            }
          } else {
            throw new TypeError('Type of `key` must be string, array of strings or undefined.');
          }
        });
        return results;
      } else if ('undefined' === keyType) {
        return this.clone();
      } else {
        throw new TypeError('Type of `key` must be string, array of strings or undefined.');
      }
    }

    /**
     * Save the `value` in store with name `key`.
     *
     * @param {String|Object}   key   Name of the value in store.  Or object of
     * key/value pairs to merge into the store.
     * @param {Any}             value Value to save.
     */

  }, {
    key: 'set',
    value: function set(key, value) {
      var _store = this._store,
          _subscriptions = this._subscriptions;


      if ('string' === typeof key) {
        setSingle(_store, _subscriptions, key, value);
      } else if ((0, _isobject2.default)(key)) {
        Object.keys(key).forEach(function (_key) {
          setSingle(_store, _subscriptions, _key, key[_key]);
        });
      } else {
        throw new TypeError('Type of `key` must be string or plain object.');
      }
    }

    /**
     * Call listening function when `set` was called on any of the `keys`.
     *
     * @param {Array}   keys  Array of keys the function will be subscribing to.
     * @param {Function} fn   Subscribing function.
     * @param {Object} [maps] Optional injection key to real key mapping.
     */


    /**
     * Unsubscribe function from all keys it's listening to.
     *
     * @param  {Function} fn The function to unsubcribe.
     */

  }]);

  return Store;
}();

/**
 * Set a single value to an object.
 */


exports.default = Store;
function setSingle(store, subscriptions, key, value) {
  store[key] = value;

  // Call subscribed functions if we have.
  var subs = subscriptions[key];
  if (subs) {
    var changed = _defineProperty({}, key, value);
    subs.forEach(function (subFn) {
      // Make sure the subFn is still legit at the time we are calling it since
      // all subscribing functions are actually `setStat`.  And previous
      // `setState` calls could trigger unmount component which later `setState`
      // belongs to.

      // Need to make the below code reproducible by test.
      // var _subs = subscriptions[key]
      // if (_subs.indexOf(subFn) === -1) {
      //   return
      // }

      if (subFn.maps) {
        var maps = subFn.maps;
        Object.keys(maps).some(function (injectKey) {
          var realKey = maps[injectKey];
          if (realKey === key) {
            changed = _defineProperty({}, injectKey, value);
            return true;
          }
          return false;
        });
      }
      subFn(changed);
    });
  }
}