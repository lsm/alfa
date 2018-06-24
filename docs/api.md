# API

## provide(component, _data_)

Provide a store to the wrapped component and its children components

* **Parameters**

  * `component` - **required** `Function|Class`: Wrapped function or class (React component).
  * `data` - _optional_ `Object|Store`: Initial data object or instance of `alfa.Store`.

* **Return**

  `Function` - it returns a function which you can use it as a regular React component.

## Provider

The declarative interface of [`provide`](/api#providecomponent-data) function. It wraps a component and its children with an Alfa store.

```jsx
// `data` is optional as it is in `provide`.
<Provider data={Object | Store}>
  // Only one child is allowed.
  <SomeComponent />
</Provider>
```

## inject(component, _input_, _output_)

Inject data to the `component` as props based on the keys provided from `input`.

* **Parameters**

  * `component` - **required** `Function|Class`: Wrapped function or class (React component).
  * `input` - _optional_ `Array|String`: The keys of input dependencies. Could be a single string or array of strings.
  * `output` - _optional_ `Array|String`: The keys of output dependencies. Could be a single string or array of strings.

* **Return**

  * `Function` - it returns a function which we can use it as a regular React component.

## subscribe(component, _input_, _output_)

Subscribe data to the `component` as props based on the keys provided from `input`. Any changes made to the keys found in `input` triggers rerender of the component.

* **Parameters**

  * `component` - **required** `Function|Class`: Wrapped function or class (React component).
  * `input` - _optional_ `Array|String`: The keys of input dependencies. Could be a single string or array of strings.
  * `output` - _optional_ `Array|String`: The keys of output dependencies. Could be a single string or array of strings.

* **Return**

  * `Function` - it returns a function which you can use it as a standard React component.

## action(actionFunction, _input_, _output_)

Attach a curry function to the `actionFunction` which you can use it as `dependency-injected` version of `actionFunction` in components under a `Provider`.

* **Parameters**

  * `actionFunction` - **required** `Function`: The action function that makes changes to the store.
  * `input` - _optional_ `Array|String`: The keys of input dependencies. Could be a single string or array of strings.
  * `output` - _optional_ `Array|String`: The keys of output dependencies. Could be a single string or array of strings.

* **Return**

  * `Function` - it returns the original `actionFunction` with a curry function `alfaAction` attached.

## keys(props)

We can define function `keys` as a static property of a component or function to support dynamic names of injected/subscribed props. For subscribed component, Alfa calls it at initialization stage (constructor). For injected component, Alfa calls it every time before it renders. For either case, Alfa always calls it before rendering the wrapped component. Then we have the chance to get more dependencies based on the returns of the `keys` function and merge them with the `props` of the component. Dynamic keys have higher priority than the original properties in props. Which means a dynamic key overrides the value of the property if they are the same.

```js
  static keys(props) => {
    return {
      userSettings: props.userID + '/settings',
    }
    // Or return an array.
    return ['settings']
  }
```

* **Parameters**

  * props - `Object`: the original `props` of the component.

* **Return**

  * `Object|Array` - Object of the mapping between real keys and dynamic keys. Alternatively, an array of real keys. Concrete keys are the actual keys found in the store. Dynamic keys are the property names of the `props` accessible in the component. A dynamic name is like an alias of its corresponding concrete key which only lives in a component.

## Store(_data_)

The `Store` class. It implements a flat key/value store with the support of subscribing changes of keys with listening functions. You do not need it for most of the cases.

* **Methods**
  * constrcutor(_data_)
    * **Parameters**
      * data - _optional_ `Object`: The initial data for the store.
  - set(key, _value_)
    Change a value or values in the store.
    * **Parameters**
      * key - **required** `String|Object`: String value of the key. Alternatively, Object of key/value pairs when you need to set multiple values at once.
      * value - _optional_ `Any`: The value of the key.
  - get(key)
    Get value or values from the store.
    * **Parameters**
      * key - **required** `String|Array`: String value of the key. Alternatively, an array of keys when you need to retrieve multiple values at once.
    * **Return**
      * `Any` the value of the key or an object which contains the key/value pairs if the `key` was an array.
  - subscribe(keys, listener, _maps_)
    Call the listening function when `set` was called on any of the `keys`.
    * **Parameters**
      * keys - **required** `Array`: Array of keys the listener will be subscribing to.
      * listener - **required** `Function`: The listener function.
      * maps - _optional_ `Object`: Optional injection key to real key mappings.
  - unsubscribe(listener)
    Unsubscribe the function from all the keys it's listening to.
    * **Parameters**
      * listener - **required** `Function`: The listener function to unsubscribe.
