import { isObject } from './common'
import { SubFn, StoreKVObject,
  StoreSetFunction, StoreSubscriptionFunction } from './types'

/**
 * Store class - a key value store with subscription support.
 */
export default class Store {
  /**
   * Internal object which holds the key/value map.
   */
  private _store: StoreKVObject = {}

  /**
   * Internal object which holds a map between the subId to SubFn + their keys.
   */
  private _subFns: Record<number, SubFn> = {}

  /**
   * Internal object to hold the subscription key to subscription id map.
   */
  private _subMaps: Record<string, Set<number>> = {}

  /**
   * Store the value of the next subscription id.
   */
  private _nextSubId = 0

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

  getAll<T, K extends keyof T, OK extends keyof P, P = T>(
    keys: K[],
    outputs?: OK[],
  ): Record<K, T[K] | StoreSetFunction<P, OK>> {
    const { get, createSetWithOutputs, _store } = this
    const results = {} as Record<K, T[K] | StoreSetFunction<P, OK>>

    keys.forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(_store, key)) {
        results[key] = get<T, K>(key)
      } else if (outputs && key === 'set') {
        results[key] = createSetWithOutputs<P, OK>(outputs)
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
  set = <T, K extends keyof T, PK = Pick<T, Extract<keyof T, K>>>(
    key: K | Partial<PK>,
    value?: T[K],
  ): void | never => {
    const { _store } = this
    let keysToDispatch: string[]
    if ('string' === typeof key) {
      _store[key] = value
      keysToDispatch = [ key ]
    } else if (isObject(key)) {
      Object.assign(_store, key as Partial<PK>)
      keysToDispatch = Object.keys(key)
    } else {
      throw new TypeError('Type of `key` must be string or plain object.')
    }

    this._dispatch(keysToDispatch)
  }

  /**
   * Call listening function when `set` was called on any of the `keys`.
   *
   * @param {Array}   keys  An array of keys that the function are subscribing to.
   * @param {Function} fn   Subscription function.
   */
  subscribe = (keys: string[], fn: StoreSubscriptionFunction): (() => void) => {
    // We treat every subscribe call as a new subscrption despite the values of the function or keys.
    // So, we store the combination of keys+fn in an object
    // and using a number id as the unique identifier of the subscription.
    const subId = this._nextSubId++
    const subFn: SubFn = {
      fn,
      keys,
    }

    // Add it to the subscription map.
    this._subFns[subId] = subFn

    // Now, construct the key -> SubFn[] map so we can know which functions to call
    // once a key has changed.
    const { _subMaps } = this
    keys.forEach(function (key) {
      const subs = _subMaps[key]
      if (!subs) {
        _subMaps[key] = new Set([ subId ])
      } else {
        subs.add(subId)
      }
    })

    const { unsubscribe: unsub } = this

    return function unsubscribe(): void {
      unsub(subId)
    }
  }

  /**
   * Unsubscribe the function from all keys it's listening to.
   *
   * @param  {Function} fn The function to unsubcribe.
   */
  unsubscribe = (subId: number): void => {
    const { _subMaps } = this

    // First remove it from the key->subId map.
    Object.values(_subMaps).forEach(function (subMap) {
      // Remove the function.
      subMap.delete(subId)
    })

    // Then remove it from the subId->subFn map.
    delete this._subFns[subId]
  }

  createSetWithOutputs = <T, K extends keyof T>(outputs: K[]): StoreSetFunction<T, K> => {
    const { set } = this

    function check(key: K): void | never {
      if (Array.isArray(outputs) && outputs.indexOf(key) === -1) {
        // Throw exception if the output key is not allowed.
        throw new Error(`Output key "${key}" is not allowed. You need to define it as an output when calling inject/subscribe.`)
      }
    }

    return function checkOutputAndSet(output, value): void | never {
      if (typeof output === 'string') {
        check(output as K)
        set<T, K>(output, value)
      } else if (isObject(output)) {
        Object.keys(output).forEach(check as (k: string) => void)
        set<T, K>(output)
      } else {
        throw new TypeError('Expect string or plain object as first argument.')
      }
    }
  }

  /**
   * Merge the store with the provided data.
   * @param data The data to merge with.
   */
  merge<T>(data: T): void {
    Object.assign(this._store, data)
  }

  reset(): void {
    this._store = {}
  }

  clone = (): StoreKVObject => {
    const cloned: StoreKVObject = {}
    const { _store } = this
    Object.keys(_store).forEach(key => cloned[key] = _store[key])
    return cloned
  }

  /**
  * Dispatch the changed keys to call their corresponding subscription functions.
  */
  private _dispatch = (keys: string[]): void => {
    const self = this
    const { _subFns, _subMaps } = this

    // Uncurry alfa action functions
    // @todo implement actions
    // if (typeof value === 'function' && (value as ActionFunction).alfaAction) {
    //   value = (value as ActionFunction).alfaAction(this)
    // }

    const called: Record<number, boolean> = {}

    keys.forEach(key => {
      const subIds = _subMaps[key]

      // Call subscription functions if we have any.
      if (!Array.isArray(subIds)) {
        return
      }

      subIds.forEach(function(subId){
        if (!called[subId]) {
          // This subscription hasn't been called yet. Let's call it.
          const subFn = _subFns[subId]

          // Make sure the subFn is still legit at the time we are calling it since
          // all subscription functions are actually `setState`.
          // And previous `setState` calls could trigger unmounting a component
          // which a later `setState` belongs to.
          if (subFn) {
            // Get the arguments from the store.
            const args = self.getAll<StoreKVObject, string, string>(subFn.keys)

            // Call the subscription function.
            subFn.fn(args)
          }

          // Mark the subscription as called.
          called[subId] = true
        }
      })
    })
  }
}
