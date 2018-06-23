import isobject from 'isobject'
import { normalizeInputs, normalizeOutputs } from './injection'

export default function action(func, inputs, outputs) {
  inputs = normalizeInputs('alfaAction', inputs)
  outputs = normalizeOutputs('alfaAction', inputs, outputs)

  func.alfaAction = function(store) {
    // const set = store.setWithOutputs(outputs)
    return function(args) {
      const input = store.get(inputs)
      input.set = store.setWithOutputs(outputs)

      const result = func({ ...input, ...args })
      if (isobject(result)) {
        input.set(result)
      }
    }
  }

  return func
}
