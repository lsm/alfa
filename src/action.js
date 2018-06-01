import isobject from 'isobject'
import { normalizeInputs, normalizeOutputs } from './injection'

export default function action(name, func, inputs, outputs) {
  inputs = normalizeInputs(name, inputs)
  outputs = normalizeOutputs(name, inputs, outputs)
  return {
    name: name,
    alfaAction: function(store) {
      return function(args) {
        const input = store.get(inputs)
        if (outputs) {
          input.set = store.setWithOutputs(outputs)
        }

        const result = func({ ...input, ...args })
        if (isobject(result)) {
          store.set(result)
        }
      }
    }
  }
}
