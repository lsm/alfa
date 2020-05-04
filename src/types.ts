import Store from './store'

// Types for Store.
export interface StoreKVObject {
  [k: string]: unknown;
}
export type StoreSetKey = string | StoreKVObject
export interface StoreSetFunction<T, K extends keyof T = keyof T, PK = Pick<T, Extract<T, K>>> {
  (key: keyof K | Partial<PK>, value?: T[K]): void;
}
export interface StoreSubscriptionFunction {
  (data: StoreKVObject): void;
}

export interface SubFn {
  fn: StoreSubscriptionFunction;
  keys: string[];
}

/**
 * Context type.
 */
export interface ProviderContext {
  alfaStore: Store;
}

// Types for action.

export interface ActionFunction<P, R> {
  (props: P): R;
}

export interface ActionFunctionHOF<P, R, IK,
  DP = Pick<P, Exclude<keyof P, IK>>,
  IP = Pick<P, Extract<keyof P, IK>>
> {
  (store: Store): ActionFunction<DP & Partial<IP>, R>;
}

// Types for Provider.

/**
 * ProviderData. This could be several types:
 * 1. The initial data of the private store if it's an plain object.
 * 2. Nothing. A private store will be created internally.
 */
export type ProviderData = Record<string, unknown> | undefined;

/**
 * Props type of the Provider class.
 */
export interface ProviderProps {
  data?: ProviderData;
}
