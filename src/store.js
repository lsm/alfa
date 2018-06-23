import isobject from 'isobject'

/**
 * The Store class. It's a key value store with simple subscription support.
 */
export default class Store {
  /**
   * Constructor
   */
  constructor(data) {
    /**
     * Internal object which holds the key/value map.
     * @type {Object}
     */
    this._store = {}

    /**
     * Internal object which holds all the subscription functions.
     * @type {Object}
     */
    this._subscriptions = {}

    this.set = this.set.bind(this)

    // Initial store if we have data.
    data && this.set(data)
  }

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
    const _store = this._store

    if ('string' === keyType) {
      return _store[key]
    } else if (Array.isArray(key) && key.length > 0) {
      const results = {}
      key.forEach(function(k) {
        if ('string' === typeof k) {
          if (_store.hasOwnProperty(k)) {
            results[k] = _store[k]
          }
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
    const store = this

    if ('string' === typeof key) {
      setSingle(store, key, value)
    } else if (isobject(key)) {
      Object.keys(key).forEach(function(_key) {
        setSingle(store, _key, key[_key])
      })
    } else {
      throw new TypeError('Type of `key` must be string or plain object.')
    }
  }

  setWithOutputs = outputs => {
    const { set } = this
    return function checkOutputAndSet(key, value, maps) {
      if (isobject(key)) {
        Object.keys(key).forEach(function(_key) {
          checkOutputAndSet(_key, key[_key], maps)
        })
        return
      }

      if (Array.isArray(outputs) && outputs.indexOf(key) === -1) {
        // Throw exception if the output key is not allowed.
        throw new Error(
          `Output key "${key}" is not allowed. You need to define it as an output when calling inject/subscribe.`
        )
      }

      if (maps && maps[key]) {
        key = maps[key]
      }

      set(key, value)
    }
  }

  clone = () => {
    const cloned = {}
    const { _store } = this
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
  subscribe = (keys, fn, maps) => {
    if ('function' !== typeof fn) {
      throw new TypeError('`fn` must be a function')
    }

    if (maps) {
      fn.maps = maps
    }

    const { _subscriptions } = this

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
  unsubscribe = fn => {
    const { _subscriptions } = this
    Object.keys(_subscriptions).forEach(function(key) {
      const subs = _subscriptions[key]
      subs && (_subscriptions[key] = subs.filter(f => f !== fn))
    })
  }
}

/**
 * Set a single value to an object.
 */
function setSingle(store, key, value) {
  const { _store, _subscriptions } = store

  // Uncurry alfa action functions
  if (typeof value === 'function' && value.alfaAction) {
    value = value.alfaAction(store)
  }

  // Save the value to the store.
  _store[key] = value

  // Call subscribed functions if we have.
  const subs = _subscriptions[key]
  if (subs) {
    var changed = {
      [key]: value
    }
    subs.forEach(function(subFn) {
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
