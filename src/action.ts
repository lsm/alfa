import Store from './store'
import { isObject, validateInputs, validateOutputs } from './common'
import { StoreKVObject, ActionFunction,
  ActionFunctionHOF, StoreSetFunction } from './types'

export default function action<
  P, R, IK extends string, OK extends string,
  DP = Pick<P, Exclude<keyof P, IK>>,
  IP = Pick<P, Extract<keyof P, IK>>
>(
  func: ActionFunction<P, R>,
  inputs: IK[], outputs?: OK[],
): ActionFunctionHOF<P, R, IK, DP, IP> {
  validateInputs(func.name, inputs)
  validateOutputs(func.name, inputs, outputs, 'no force')

  return function(store: Store): ActionFunction<DP & Partial<IP>, R> {
    return function(args: DP & Partial<IP>): R {
      const injected = store.getAll<IP>(inputs, outputs)
      const funcArgs = { ...injected, ...args } as unknown as P & {set?: StoreSetFunction}
      const result = func(funcArgs)

      if (funcArgs.set && isObject(result)) {
        funcArgs.set(result as StoreKVObject)
      }
      return result
    }
  }
}
