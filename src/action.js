import isobject from 'isobject'
import { normalizeInputs, normalizeOutputs } from './injection'

export default function action(func, inputs, outputs) {
  inputs = normalizeInputs('alfa', inputs)
  outputs = normalizeOutputs('alfa', inputs, outputs)

  const alfaAction = function(store) {
    return function(args) {
      const input = store.get(inputs)
      input.set = store.setWithOutputs(outputs)

      const result = func({ ...input, ...args })
      if (isobject(result)) {
        input.set(result)
      }
    }
  }

  alfaAction.isAlfaAction = true

  return alfaAction
}
