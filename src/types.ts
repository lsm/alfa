import Store from './store'

// Types for Store.
export type StoreKVObject = Record<string, unknown>
export type StoreSetKey = string | StoreKVObject
export type StoreSetFunction = (key: StoreSetKey, value?: unknown) => void;
export type StoreFunctionSubscription = (data: StoreKVObject) => void;

/**
 * Context type.
 */
export type ProviderContext = {
  alfaStore: Store;
}

// Types for action.

export type ActionFunction<P, R> = (props: P) => R
export type ActionFunctionHOF<P, R> = (store: Store) => ActionFunction<P, R>
