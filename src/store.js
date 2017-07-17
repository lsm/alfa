

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
            if (_store.hasOwnProperty(k))
              results[k] = _store[k]
          } else {
            throw new TypeError('Type of `key` must be string, array of strings or undefined.')
          }
        })
        return results
      } else if ('undefined' === keyType) {
        return this.clone()
      } else {
        throw new TypeError('Type of `key` must be string, array of strings or undefined.')
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
      Object.keys(_store).forEach(key => cloned[key] = _store[key])
      return cloned
    }

    /**
     * Call listening function when `set` was called on any of the `keys`.
     * 
     * @param {Array}   keys  Array of keys the function will be subscribing to.
     * @param {Function} fn   Subscribing function.
     */
    subscribe(keys, fn) {
      if ('function' !== typeof fn)
        throw new TypeError('`fn` must be a function')

      Array.isArray(keys) && keys.forEach(function(key) {
        const subs = _subscriptions[key]
        if (Array.isArray(subs)) {
          -1 === subs.indexOf(key) && subs.push(fn)
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
        subs && (_subscriptions[key] = subs.filter((f) => f !== fn))
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
    const changed = {
      [key]: value
    }
    subs.forEach(function(subFn) {
      subFn(changed)
    })
  }
}

