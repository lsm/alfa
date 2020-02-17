import {normalizeInputs} from './input'
import {normalizeOutputs} from './output'

export function normalize(WrappedComponent, inputs, outputs) {
  if (typeof WrappedComponent === 'function') {
    const name = WrappedComponent.name
    const keys = typeof WrappedComponent.keys === 'function' ? WrappedComponent.keys : null
    if (keys) {
      console.warn('[Deprecated] The support of `keys` will be removed in future release.')
    }
    return [
      normalizeInputs(name, inputs, keys), 
      normalizeOutputs(name, inputs, outputs),
      keys,
    ]
  } else {
    // istanbul ignore next
    const error = `Alfa inject/subscribe only accepts function or class. Got "${typeof WrappedComponent}".`
    throw new TypeError(error)
  }
}