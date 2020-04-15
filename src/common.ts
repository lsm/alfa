import { ComponentType } from 'react'
import Store from './store'

export function validateInputs(name: string, inputKeys: string[]): string[] | never {
  if (Array.isArray(inputKeys) && inputKeys.every(key => typeof key === 'string')) {
    return inputKeys
  }

  throw new TypeError(`${name}: inject/subscribe only accepts array of strings as second parameter (inputs).`)
}

export function validateOutputs(
  name: string,
  inputs: string[], outputs: string[] = [], flag = 'force set',
): void | never {
  // Check if output keys are provided when `set` is present in input keys.
  if (flag === 'force set' && inputs.indexOf('set') > -1 && (!Array.isArray(outputs) || outputs.length === 0)) {
    throw new Error(`${name}: outputKeys are required for "inject/subscribe"
    when "set" is one of values in the inputKeys.`)
  }

  // Make sure outputs contains only string values.
  if (!Array.isArray(outputs) || outputs.some(key => typeof key !== 'string')) {
    // Throw exception if any key of the outputs is not supported.
    throw new TypeError(`${name}: inject/subscribe only accepts
    array of strings as outputKeys.`)
  }
}

export function validate<P>(
  WrappedComponent: ComponentType<P> | Function,
  inputs: string[], outputs: string[] = [],
): void | never {
  if (typeof WrappedComponent === 'function') {
    const name = WrappedComponent.name
    validateInputs(name, inputs)
    validateOutputs(name, inputs, outputs)
  } else {
    // istanbul ignore next
    const error = `Alfa inject/subscribe only accepts
      function or class. Got "${typeof WrappedComponent}".`
    throw new TypeError(error)
  }
}

// Shamelessly copied from the isObject package ;)
export function isObject(val: unknown): boolean {
  return val != null && typeof val === 'object' && Array.isArray(val) === false
}

export function getProps<DirectProps, AllProps>(
  props: DirectProps,
  inputKeys: string[],
  outputKeys: string[] = [],
  store?: Store,
): AllProps {
  if (store) {
    const injectedProps = store.get(inputKeys) as StoreKVObject

    // Need to create and inject set.
    if (injectedProps.set) {
      injectedProps.set = store.createSetWithOutputs(outputKeys)
    }

    // Props passed in directly to constructor has lower priority than inputs
    // injected from the store.
    return { ...props, ...injectedProps } as unknown as AllProps
  }

  return props  as unknown as AllProps
}
