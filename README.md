# Alfa

> Effortless React State Management.

[![License MIT][license-img]][license-url]
[![NPM version][npm-img]][npm-url]
[![Downloads][down-img]][npm-url]
[![Dependencies][dep-image]][dep-url]
[![build status][travis-img]][travis-url]
[![Coverage Status][coverage-img]][coverage-url]
[![Code Climate][climate-img]][climate-url]

[![Sauce Test Status](https://saucelabs.com/browser-matrix/alfajs.svg)](https://saucelabs.com/u/alfajs)

## Why Alfa?

[React](https://facebook.github.io/react/) is an excellent library for creating interactive and stateful views. However, things become unclear when you need to `share & change data across components`.

Alfa is an **intuitive and straightforward way** to manage React state. It completely decouples the complex relationships between components and let you focus on making **components that work anywhere**.

Its **simple** design allows you to adopt it in a matter of minutes while at the same time provides your essential tools to keep your application code easy to change and understand. Here is a list of things why it is the perfect fit for your next React app:

* **Easy** - Only 4 functions/APIs to learn.
* **Fast** - Alfa wraps your components with a thin layer. It introduces a little or no performance impacts.
* **Small** - ~ 190LOC & 3KB minified + gzipped.
* **Async** - Alfa supports asynchronous operation natively without additional packages.
* **Explicit** - Alfa lets you know what a component requires (input) and what it changes (output).
* **Transparent** - You can use and unit test your components as it is without Alfa. Users of your lib/component could but don't have to use Alfa at all.
* **React Native** - Support React Native out of the box.
* **Server Render** - Support isomorphic app out of the box.
* **Production Ready** - 100% test coverage and being used in productions.

## Links

* [Documentation](https://lsm.github.io/alfa)
* [Hello Wrold Example](https://github.com/lsm/alfa/tree/master/examples/hello)
* [TodoMVC Example](https://github.com/lsm/alfa/tree/master/examples/todomvc)

## MIT License

Copyright <2017-2018> Marc Liu

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[dep-url]: https://david-dm.org/lsm/alfa
[dep-image]: https://david-dm.org/lsm/alfa.svg
[dev-url]: https://david-dm.org/lsm/alfa?type=dev
[dev-image]: https://david-dm.org/lsm/alfa/dev-status.svg
[license-img]: https://img.shields.io/npm/l/alfa.svg
[license-url]: http://opensource.org/licenses/MIT
[npm-img]: https://badge.fury.io/js/alfa.svg
[down-img]: https://img.shields.io/npm/dm/alfa.svg
[npm-url]: https://npmjs.org/package/alfa
[travis-img]: https://travis-ci.org/lsm/alfa.svg?branch=master
[travis-url]: http://travis-ci.org/lsm/alfa
[coverage-img]: https://coveralls.io/repos/github/lsm/alfa/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/lsm/alfa?branch=master
[climate-img]: https://codeclimate.com/github/lsm/alfa/badges/gpa.svg
[climate-url]: https://codeclimate.com/github/lsm/alfa
