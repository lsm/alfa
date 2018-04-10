/**
 * Create a key value store with simple subscription support.
 *
 * @return {Store}
 */
export default function createStore(data) {
  /**
   * Internal object which holds the key/value map.
   * @type {Object}
   */
  const _store = {
    ...data
  }

  /**
   * Internal object which holds all the subscription functions.
   * @type {Object}
   */
  const _subscriptions = {}

  /**
   * The Store class.
   */
  class Store {
    /**
     * @type {Boolean}
     */
    isAlfaStore = true

    /**
     * Get value from store by key.
     *
     * @param  {String|undefined} key Name of the value to get.
     * @return {Any}        Value.
     */
    get(key) {
      const keyType = typeof key

      if ('string' === keyType) {
        return _store[key]
      } else if (Array.isArray(key) && key.length > 0) {
        const results = {}
        key.forEach(function(k) {
          if ('string' === typeof k) {
            if (_store.hasOwnProperty(k)) results[k] = _store[k]
          } else {
            throw new TypeError(
              'Type of `key` must be string, array of strings or undefined.'
            )
          }
        })
        return results
      } else if ('undefined' === keyType) {
        return this.clone()
      } else {
        throw new TypeError(
          'Type of `key` must be string, array of strings or undefined.'
        )
      }
    }

    /**
     * Save the `value` in store with name `key`.
     *
     * @param {String|Object}   key   Name of the value in store.  Or object of
     * key/value pairs to merge into the store.
     * @param {Any}             value Value to save.
     */
    set(key, value) {
      var keyType = typeof key

      if ('string' === keyType) {
        setSingle(_store, _subscriptions, key, value)
      } else if (isPlainObject(key)) {
        Object.keys(key).forEach(function(_key) {
          setSingle(_store, _subscriptions, _key, key[_key])
        })
      } else {
        throw new TypeError('Type of `key` must be string or plain object.')
      }
    }

    clone() {
      const cloned = {}
      Object.keys(_store).forEach(key => (cloned[key] = _store[key]))
      return cloned
    }

    /**
     * Call listening function when `set` was called on any of the `keys`.
     *
     * @param {Array}   keys  Array of keys the function will be subscribing to.
     * @param {Function} fn   Subscribing function.
     * @param {Object} [maps] Optional injection key to real key mapping.
     */
    subscribe(keys, fn, maps) {
      if ('function' !== typeof fn)
        throw new TypeError('`fn` must be a function')

      if (maps) fn.maps = maps

      Array.isArray(keys) &&
        keys.forEach(function(key) {
          const subs = _subscriptions[key]
          if (Array.isArray(subs)) {
            subs.indexOf(key) === -1 && subs.push(fn)
          } else {
            _subscriptions[key] = [fn]
            return
          }
        })
    }

    /**
     * Unsubscribe function from all keys it's listening to.
     *
     * @param  {Function} fn The function to unsubcribe.
     */
    unsubscribe(fn) {
      Object.keys(_subscriptions).forEach(function(key) {
        const subs = _subscriptions[key]
        subs && (_subscriptions[key] = subs.filter(f => f !== fn))
      })
    }
  }

  /**
   * Return a new instance of Store
   */
  return new Store()
}

export function isPlainObject(obj) {
  return obj && 'object' === typeof obj && !Array.isArray(obj)
}

export function setRawStore(rawStore, key, value) {
  var keyType = typeof key

  if ('string' === keyType && key) {
    rawStore[key] = value
  } else if (isPlainObject(key)) {
    Object.keys(key).forEach(function(_key) {
      rawStore[_key] = key[_key]
    })
  } else {
    throw new TypeError('Type of `key` must be string or plain object.')
  }
}

/**
 * Set a single value to an object.
 */
function setSingle(store, subscriptions, key, value) {
  store[key] = value

  // Call subscribed functions if we have.
  const subs = subscriptions[key]
  if (subs) {
    var changed = {
      [key]: value
    }
    subs.forEach(function(subFn) {
      // Make sure the subFn is still legit at the time we are calling it since
      // all subscribing functions are actually `setStat`.  And previous
      // `setState` calls could trigger unmount component which later `setState`
      // belongs to.
      var _subs = subscriptions[key]
      if (subs && -1 === _subs.indexOf(subFn)) return

      if (subFn.maps) {
        var maps = subFn.maps
        Object.keys(maps).some(function(injectKey) {
          const realKey = maps[injectKey]
          if (realKey === key) {
            changed = {
              [injectKey]: value
            }
            return true
          }
          return false
        })
      }
      subFn(changed)
    })
  }
}
