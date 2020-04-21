import Store from './store'
import { isObject, validateInputs, validateOutputs } from './common'
import { ActionFunction, ActionFunctionHOF, StoreSetFunction } from './types'

export default function action<
  P, R, IK extends keyof IP, OK extends keyof P,
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
      const injected = store.getAll<IP, IK, OK, P>(inputs, outputs)
      const funcArgs = Object.assign(injected, args) as unknown as P & {set?: StoreSetFunction<P, OK>}
      const result = func(funcArgs)

      if (funcArgs.set && isObject(result)) {
        funcArgs.set(result)
      }
      return result
    }
  }
}
