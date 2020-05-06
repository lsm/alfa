let initialized = false

function setup() {
  if (initialized) {
    return
  }

  initialized = true

  const { JSDOM } = require('jsdom')

  const jsdom = new JSDOM('<!doctype html><html><body></body></html>')
  const { window } = jsdom

  function copyProps(src, target) {
    const props = Object.getOwnPropertyNames(src)
      .filter(prop => 'undefined' === typeof target[prop])
      .map(prop => Object.getOwnPropertyDescriptor(src, prop))
    Object.defineProperties(target, props)
  }

  global.window = window
  global.document = window.document
  global.navigator = { userAgent: 'node.js' }
  copyProps(window, global)
}

if ('unit' === process.env.TEST_ENV) {
  setup()
}
