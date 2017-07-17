0.3.2 (2017/07/17)
==================
- When getting multiple keys from a store using `store.get(keys)` the result
will not contain undefined value if the internal data object of store has no
such property.
- Always use store instance from context if it exists.


0.3.1 (2017/07/16)
==================
Fix a crash for `provide/subscribe` when required value is undefined.


0.3.0 (2017/07/16)
==================
The top level API `set` and `get` have been removed from this version to avoid 
anti-pattern usage and confusion when multiple stores are involved. Full list of
changes see below:

- **[Breaking]** Remove `get` from top level API.
- **[Breaking]** Remove `set` from top level API.
`set` can be retrived through `provide` or `subscribe`.
- **[Breaking]** Function `action` doesn't work as getter anymore.
All defined actions should be retrived from `provide` or `subscribe`.
- **[Breaking]** Data injected from store always have higher priority than props.
This makes the behavior of `priority` consistent between `provide` and 
`subscribe`.
- Action now can use the correct store at execution time.
- Call `get()` without argument returns shallow copy of the internal store.
- Fix a bug in `createAlfaProvidedComponent`.
- Add testing and CI facilities.


0.2.0 (2017/07/08)
==================
- Support server side renderring.
- Export function `createStore`.


0.1.0 (2017/07/05)
==================
Initial release.
