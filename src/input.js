import isobject from 'isobject'

export function normalizeInputs(name, inputs, dynamicInputs) {
  if (inputs && 'string' === typeof inputs) {
    return [inputs]
  } else if (Array.isArray(inputs)) {
    return inputs.filter(input => typeof input === 'string')
  } else if ('function' === typeof dynamicInputs) {
    return []
  } else {
    throw new TypeError(
      `${name}: inject/subscribe only accepts string or array of strings as second parameter (inputs) when static property 'keys' of component does not exist.`
    )
  }
}

export function getInjectedProps(inputs, outputs, alfaStore) {
  const injectedProps = {
    ...alfaStore.get(inputs)
  }

  // Need to inject set.
  if (inputs.indexOf('set') > -1) {
    injectedProps.set = alfaStore.setWithOutputs(outputs)
  }

  return injectedProps
}

export function getProps(props, inputs, outputs, alfaStore, keys) {
  if (alfaStore) {
    const injectedProps = getInjectedProps(inputs, outputs, alfaStore)
    // Props passed in directly to constructor has lower priority than inputs
    // injected from the store.
    let _props = { ...props, ...injectedProps }

    if (keys) {
      const dynamicInputs = getDynamicInputs(keys, _props, inputs)
      _props = { ...props, ...getDynamicProps(dynamicInputs, outputs, alfaStore) }
    }

    return _props
  }
  
  return props
}

/**
 * Function getKeys could serve as a function which produce
 * input keys dynamically for the component based on props at render time.
 */
export function getDynamicInputs(getKeys, props, staticInputs) {
  if (getKeys && 'function' === typeof getKeys) {
    const dynamicInputs = getKeys(props)

    if (Array.isArray(dynamicInputs)) {
      return {
        inputs: [...staticInputs, ...dynamicInputs]
      }
    } else if (isobject(dynamicInputs)) {
      // Object of mappings between the property name we are going to 
      // inject to the component and real input keys that in the store.
      const comInputKeys = Object.keys(dynamicInputs)
      const storeInputKeys = comInputKeys.map(key => dynamicInputs[key])
      // We pull the value from the store using the keys in storeInputKeys
      // and map to the name defined in the dynamicInputs object before providing
      // it to the component.
      return {
        keys: comInputKeys,
        maps: dynamicInputs,
        inputs: [...staticInputs, ...storeInputKeys]
      }
    }
  }

  return {
    inputs: staticInputs
  }
}

/**
 * Load dependencies with the result of calling `keys` function of the component.
 *
 * This gives people the ability to load dynamic dependencies based on the props
 * of the component at runtime.
 * It makes a map between the dynamic names of the dependencies and the names
 * of the properties injected in the `props` of the component.
 * That helps maintaining a simple naming system in the application code.
 *
 * @param  {Function} keys
 * @param  {Object} props
 * @param  {Array} outputs
 * @param  {Object} alfaStore
 * @return {Object}
 */
export function getDynamicProps({ keys, maps, inputs }, outputs, alfaStore) {
  const _props = getInjectedProps(inputs, outputs, alfaStore)

  if (maps) {
    keys.forEach(key => {
      _props[key] = _props[maps[key]]
    })
    // Map outputs
    if (outputs && 'function' === typeof _props.set) {
      // The `set` of `props` which is obtained from calling
      // `alfaStore.setWithOutputs(outputs)`
      const _setWithOutputs = _props.set
      // Call `_setWithOutputs` with maps if
      _props.set = function(key, value) {
        _setWithOutputs(key, value, maps)
      }
    }
    return _props
  } else {
    // No mapped props
    return _props
  }
}
