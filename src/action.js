import isobject from 'isobject'
import { normalizeInputs, normalizeOutputs } from './injection'

export default function action(func, inputs, outputs) {
  inputs = normalizeInputs(func.name, inputs)
  outputs = normalizeOutputs(func.name, inputs, outputs)
  return {
    name: func.name,
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
