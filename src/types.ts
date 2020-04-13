// Types for Store.
export type StoreKVObject = {
  [key: string]: unknown;
}

export type StoreSetKey = string | KVObject
export type StoreSetFunction = (key: InputKey, value?: unknown) => void;
export type StoreFunctionSubscription = (data: KVObject) => void;

// Types for action.

export type ActionFunction = Function & { alfaAction: Function }
