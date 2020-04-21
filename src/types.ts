import Store from './store'

// Types for Store.
export type StoreKVObject = {[k: string]: unknown}
export type StoreSetKey = string | StoreKVObject
export type StoreSetFunction<T, K extends keyof T, PK = Pick<T, Extract<keyof T, K>>> = (key: K | Partial<PK>, value?: T[K]) => void;
export type StoreSubscriptionFunction = (data: StoreKVObject) => void;

/**
 * Context type.
 */
export type ProviderContext = {
  alfaStore: Store;
}

// Types for action.

export type ActionFunction<P, R> = (props: P) => R
export type ActionFunctionHOF<P, R, IK,
  DP = Pick<P, Exclude<keyof P, IK>>,
  IP = Pick<P, Extract<keyof P, IK>>
> = (store: Store) => ActionFunction<DP & Partial<IP>, R>
