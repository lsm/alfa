'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = createStore;
exports.isPlainObject = isPlainObject;
exports.setRawStore = setRawStore;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Create a key value store with simple subscription support.
 * 
 * @return {Store}
 */
function createStore(data) {
  /**
   * Internal object which holds the key/value map.
   * @type {Object}
   */
  var _store = _extends({}, data);

  /**
   * Internal object which holds all the subscription functions.
   * @type {Object}
   */
  var _subscriptions = {};

  /**
   * The Store class.
   */

  var Store = function () {
    function Store() {
      _classCallCheck(this, Store);
    }

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

        if ('string' === keyType) {
          return _store[key];
        } else if (Array.isArray(key) && key.length > 0) {
          var results = {};
          key.forEach(function (k) {
            if ('string' === typeof k) {
              if (_store.hasOwnProperty(k)) results[k] = _store[k];
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
        var keyType = typeof key === 'undefined' ? 'undefined' : _typeof(key);

        if ('string' === keyType) {
          setSingle(_store, _subscriptions, key, value);
        } else if (isPlainObject(key)) {
          Object.keys(key).forEach(function (_key) {
            setSingle(_store, _subscriptions, _key, key[_key]);
          });
        } else {
          throw new TypeError('Type of `key` must be string or plain object.');
        }
      }
    }, {
      key: 'clone',
      value: function clone() {
        var cloned = {};
        Object.keys(_store).forEach(function (key) {
          return cloned[key] = _store[key];
        });
        return cloned;
      }

      /**
       * Call listening function when `set` was called on any of the `keys`.
       * 
       * @param {Array}   keys  Array of keys the function will be subscribing to.
       * @param {Function} fn   Subscribing function.
       * @param {Object} [maps] Optional injection key to real key mapping.
       */

    }, {
      key: 'subscribe',
      value: function subscribe(keys, fn, maps) {
        if ('function' !== typeof fn) throw new TypeError('`fn` must be a function');

        if (maps) fn.maps = maps;

        Array.isArray(keys) && keys.forEach(function (key) {
          var subs = _subscriptions[key];
          if (Array.isArray(subs)) {
            -1 === subs.indexOf(key) && subs.push(fn);
          } else {
            _subscriptions[key] = [fn];
            return;
          }
        });
      }

      /**
       * Unsubscribe function from all keys it's listening to.
       * 
       * @param  {Function} fn The function to unsubcribe.
       */

    }, {
      key: 'unsubscribe',
      value: function unsubscribe(fn) {
        Object.keys(_subscriptions).forEach(function (key) {
          var subs = _subscriptions[key];
          subs && (_subscriptions[key] = subs.filter(function (f) {
            return f !== fn;
          }));
        });
      }
    }]);

    return Store;
  }();

  /**
   * Return a new instance of Store
   */


  return new Store();
}

function isPlainObject(obj) {
  return obj && 'object' === (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) && !Array.isArray(obj);
}

function setRawStore(rawStore, key, value) {
  var keyType = typeof key === 'undefined' ? 'undefined' : _typeof(key);

  if ('string' === keyType && key) {
    rawStore[key] = value;
  } else if (isPlainObject(key)) {
    Object.keys(key).forEach(function (_key) {
      rawStore[_key] = key[_key];
    });
  } else {
    throw new TypeError('Type of `key` must be string or plain object.');
  }
}

/**
 * Set a single value to an object.
 */
function setSingle(store, subscriptions, key, value) {
  store[key] = value;

  // Call subscribed functions if we have.
  var subs = subscriptions[key];
  if (subs) {
    var changed = _defineProperty({}, key, value);
    subs.forEach(function (subFn) {
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