import { isObject } from './common'
import { ActionFunction, StoreFunctionSubscription, StoreKVObject, StoreSetFunction, StoreSetKey } from './types'

type SetFlag = 'silent' | 'loud'

/**
 * Store class - a key value store with subscription support.
 */
export default class Store {
  /**
   * Internal object which holds the key/value map.
   */
  private _store: StoreKVObject = {}

  /**
   * Internal object which holds all the subscription functions.
   */
  private _subscriptions: { [key: string]: StoreFunctionSubscription[] } = {}

  /**
   * Constructor
   */
  constructor(data?: object) {
    // Initialize store if we have data.
    if (data) {
      this.set(data as StoreKVObject)
    }
  }

  /**
   * Property to tell this is an alfa store.
   */
  isAlfaStore = true

  /**
   * Get value from store by key.
   *
   * @param key Name of the value to get.
   */
  get = <T, K extends keyof T>(key: K): T[K] => {
    return (this._store as unknown as T)[key] as T[K]
  }

  getAll<T, K extends keyof T, OK extends keyof T>(
    keys: K[],
    outputs?: OK[],
  ): Record<K, T[K] | StoreSetFunction<T, OK>> {
    const { get, createSetWithOutputs, _store } = this
    const results = {} as Record<K, T[K] | StoreSetFunction<T, OK>>

    keys.forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(_store, key)) {
        if (outputs && key === 'set') {
          results[key] = createSetWithOutputs<T, OK>(outputs)
        } else {
          results[key] = get<T, K>(key)
        }
      }
    })

    return results
  }

  /**
   * Save the `value` in store with name `key`.
   *
   * @param key     Name of the value in store. Or object of
   * key/value pairs to merge into the store.
   * @param value   Value to save.
   */
  set = (key: StoreSetKey, value?: unknown): void | never => {
    const { _setSingle } = this
    if ('string' === typeof key) {
      _setSingle(key, value)
    } else if (isObject(key)) {
      Object.keys(key).forEach(function (_key) {
        _setSingle(_key, key[_key])
      })
    } else {
      throw new TypeError('Type of `key` must be string or plain object.')
    }
  }

  /**
   * Merge the store with the provided data.
   * @param data The data to merge with.
   */
  merge(data: StoreKVObject): void {
    Object.keys(data).forEach(key => {
      this._setSingle(key, data[key], 'silent')
    }, this)
  }

  reset(): void {
    this._store = {}
  }

  createSetWithOutputs = <T, K extends keyof T>(outputs: K[]): StoreSetFunction<T, K> => {
    const { set } = this

    return function checkOutputAndSet(key, value): void | never {
      if (isObject(key)) {
        const obj = key as StoreKVObject
        Object.keys(obj).forEach(function (_key) {
          checkOutputAndSet(_key, obj[_key])
        })
        return
      }

      // key is a string.
      const str = key as string

      if (Array.isArray(outputs) && outputs.indexOf(str) === -1) {
        // Throw exception if the output key is not allowed.
        throw new Error(`Output key "${str}" is not allowed. You need to define it as an output when calling inject/subscribe.`)
      }

      set(str, value)
    }
  }

  clone = (): StoreKVObject => {
    const cloned: StoreKVObject = {}
    const { _store } = this
    Object.keys(_store).forEach(key => cloned[key] = _store[key])
    return cloned
  }

  /**
   * Call listening function when `set` was called on any of the `keys`.
   *
   * @param {Array}   keys  Array of keys that the function is subscribing to.
   * @param {Function} fn   Subscription function.
   */
  subscribe = (keys: string[], fn: StoreFunctionSubscription): void | never => {
    if ('function' !== typeof fn) {
      throw new TypeError('Expect `fn` to be a function')
    }

    if (Array.isArray(keys)) {
      const { _subscriptions } = this
      keys.forEach(function (key) {
        const subs = _subscriptions[key]
        if (Array.isArray(subs) && subs.indexOf(fn) === -1) {
          subs.push(fn)
        } else {
          _subscriptions[key] = [ fn ]
        }
      })
    }
  }

  /**
   * Unsubscribe the function from all keys it's listening to.
   *
   * @param  {Function} fn The function to unsubcribe.
   */
  unsubscribe = (fn: StoreFunctionSubscription): void => {
    const { _subscriptions } = this
    Object.keys(_subscriptions).forEach(function (key) {
      const subs = _subscriptions[key]
      if (subs) {
        // Remove the function.
        _subscriptions[key] = subs.filter(f => f !== fn)
      }
    })
  }

  /**
 * Set a single value to an object.
 */

  private _setSingle = (key: string, value: unknown, flag: SetFlag = 'loud'): void => {
    const { _store, _subscriptions } = this

    // Uncurry alfa action functions
    if (typeof value === 'function' && (value as ActionFunction).alfaAction) {
      value = (value as ActionFunction).alfaAction(this)
    }

    // Save the value to the store.
    _store[key] = value

    if (flag === 'silent') {
      return
    }

    // Call subscribed functions if we have any.
    const subs = _subscriptions[key]
    if (Array.isArray(subs)) {
      const changed = { [key]: value }

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
        subFn(changed)
      })
    }
  }
}
