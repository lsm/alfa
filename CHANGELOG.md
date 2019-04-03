# 0.6.2 (2019/04/02)

- Update dependencies.
- Move all documentation into README.md.

# 0.6.1 (2018/11/12)

- Allow set internal store silently.
- Check the `silentVersion` of store when rendering.

# 0.6.0 (2018/06/14)

- **[Breaking]** Rename `provide` to `inject`.
- **[Breaking]** Remove API `createAlfa` & `createStore`.
- **[Breaking]** Rename `app` to `provide`.
- **[NEW]** Add `Provider` as declarative API for `provide`.
- Simplify implementations of `inject` and `subscribe`.
- Rewrite `action` as a simple curry function.
- Add more documentation and tests.

# 0.5.3 (2018/05/02)

- Support old browsers.

# 0.5.2 (2017/08/03)

- Bug fix for using action in action with global store. (447fc15)

# 0.5.1 (2017/08/01)

- Export main export as object instead of function. (ec2ec6e)
- Bug fix for setting object with dynamic keys. (d7c86ca)
- Update examples and docs. (73a410a, 986e65a, 85eb6ee, 5f5fafb, 2d4ca79)

# 0.5.0 (2017/07/28)

- Bug fix for calling `setState` of unmounted component.
  1a787500760d25a356f23d78ec1b0aa1da0d12d6
- Use `null` as input to get all original arguments of action call.
  f8b44c7745622fade83dcc21dd448cbcabebeadd
- Bug fix for provide/subscribe when only `keys` are provided through static
  property of component. cd53ef2503df5520fa7db7d54ed8f0013656a9b8
- Add top level API `app()` for binding root react component.
  3b8467e0958e04adff512316037a0aa566f2ac2f
- Support for calling actions in action.
  e7f83358649c0a2c8d480a1816f7e64a59acf3c9
- Bug fix for `not`, `optional` and `boolean` value pipes.
  9a60144988c2aff7fc9af1f3dce0bac96b002e80
- Predefined output keys is required for calling set. Map dynamic keys to its
  real key value. 6ca202cf48b4005af493a28bb558e49003d935e9

# 0.4.1-0.4.2 (2017/07/20)

- Allow calling subscribe/provide without keys when Component.keys exists.
  8abc242859891fe47b5cecb8858b0683bc5dddf4
- Bug fix for dynamic output. 482a6420f8dc48fdff692f01f98d0c4499e4af4a
- Only subscribe after componentDidMount.
  98a4cacc35863772cde0eac707f3f7b9e7443275
- Bug fix for incorrectly scoped subscription variables.
  305852107f732da9c48d6c5614749fc38d710f58

# 0.4.0 (2017/07/20)

- Support dynamically inject props based on the return of `Component.keys(props)`.
- Support output dynamic keys to the store using format `realKey:$mappedKey`
  where `mappedKey` is a key from the store which its value will be used as the
  key of the output.

# 0.3.3 (2017/07/18)

- Implement error pipe.

# 0.3.2 (2017/07/17)

- When getting multiple keys from a store using `store.get(keys)` the result
  will not contain undefined value if the internal data object of store has no
  such property.
- Always use store instance from context if it exists.

# 0.3.1 (2017/07/16)

Fix a crash for `provide/subscribe` when required value is undefined.

# 0.3.0 (2017/07/16)

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

# 0.2.0 (2017/07/08)

- Support server side renderring.
- Export function `createStore`.

# 0.1.0 (2017/07/05)

Initial release.
