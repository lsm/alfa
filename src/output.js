

export function normalizeOutputs(name, inputs, outputs) {
  // Check if output keys are provided when `set` is required as input key.
  if (
    Array.isArray(inputs) &&
    inputs.indexOf('set') > -1 &&
    (!Array.isArray(outputs) || 0 === outputs.length)
  ) {
    throw new Error(
      `${name}: outputs are required as 3rd argument of function "inject/subscribe" when "set" is injected/subscribed.`
    )
  }

  if (outputs) {
    // When we have key(s) of output we need to check the type(s) of all the keys.
    if ('string' === typeof outputs) {
      // The outputs is a string then normalize it as an array.
      return [outputs]
    }

    if (
      Array.isArray(outputs) &&
      outputs.every(key => typeof key === 'string')
    ) {
      // Outputs is an array, make sure all the elements of this array are string.
      return outputs
    }

    // Throw exception if any key of the outputs is not supported.
    throw new TypeError(
      `${name}: inject/subscribe only accepts string or array of strings as 3rd parameter (outputs).`
    )
  }
}