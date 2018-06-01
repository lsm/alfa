// Karma configuration
// Generated on Tue Oct 03 2017 13:01:40 GMT-0700 (PDT)

var local = false

module.exports = function(config) {
  var browsers
  var reporters

  switch (process.env.TEST_ENV) {
    case 'browser':
      browsers = Object.keys(customLaunchers)
      reporters = ['saucelabs']
      break
    // default is local
    default:
      local = true
      browsers = ['Chrome']
      reporters = ['progress']
  }

  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['tap'],

    // list of files / patterns to load in the browser
    files: ['src/*.js', 'test/browser.js'],

    webpack: {
      // kind of a copy of your webpack config
      devtool: 'inline-source-map', // just do inline source maps instead of the default
      module: {
        rules: [
          {
            test: /(\.js|\.jsx)$/,
            exclude: /\/node_modules\//,
            loader: 'babel-loader'
          }
        ]
      },
      node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        module: 'empty',
        child_process: 'empty'
      }
    },

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only',
      noInfo: true
    },

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // add webpack as preprocessor
      'src/*.js': ['webpack', 'sourcemap'],
      'test/*.js': ['webpack', 'sourcemap']
    },

    // test results reporter to use
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: reporters,

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers: ['Chrome'],
    sauceLabs: {
      public: 'public',
      testName: 'Alfa browser tests',
      idleTimeout: 180,
      commandTimeout: 180,
      recordVideo: local,
      recordScreenshots: local
    },
    captureTimeout: 360 * 1000,
    browserNoActivityTimeout: 600 * 1000,
    browserDisconnectTimeout: 60 * 1000,
    browserDisconnectTolerance: 3,
    browsers: browsers,
    customLaunchers: !local && customLaunchers,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: !local,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 5
  })
}

// Browsers to run on Sauce Labs
// Check out https://saucelabs.com/platforms for all browser/OS combos
var customLaunchers = {
  sl_iphone_93: {
    base: 'SauceLabs',
    browserName: 'iphone',
    version: '9.3',
    deviceName: 'iPhone 6s Simulator',
    deviceOrientation: 'portrait'
  },
  // sl_iphone_103: {
  //   base: 'SauceLabs',
  //   browserName: 'iphone',
  //   version: '10.3',
  //   deviceName: 'iPhone 7 Plus Simulator',
  //   deviceOrientation: 'portrait'
  // },
  // sl_iphone_112: {
  //   base: 'SauceLabs',
  //   browserName: 'iphone',
  //   version: '11.2',
  //   deviceName: 'iPhone X Simulator',
  //   deviceOrientation: 'portrait'
  // },
  sl_chrome_26: {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: '26'
  },
  sl_chrome_30: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Linux',
    version: '30'
  },
  sl_chrome_40: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Windows 8.1',
    version: '40'
  },
  sl_chrome_50: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Windows 10',
    version: '50'
  },
  sl_chrome_latest: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'OS X 10.12',
    version: 'latest'
  },
  sl_firefox_18: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: '18'
  },
  sl_firefox_30: {
    base: 'SauceLabs',
    browserName: 'firefox',
    platform: 'Linux',
    version: '30'
  },
  sl_firefox_40: {
    base: 'SauceLabs',
    browserName: 'firefox',
    platform: 'Windows 8.1',
    version: '40'
  },
  sl_firefox_50: {
    base: 'SauceLabs',
    browserName: 'firefox',
    platform: 'Windows 10',
    version: '50'
  },
  sl_firefox_latest: {
    base: 'SauceLabs',
    browserName: 'firefox',
    platform: 'OS X 10.12',
    version: 'latest'
  },
  // sl_ipad_93: {
  //   base: 'SauceLabs',
  //   browserName: 'ipad',
  //   version: '9.3',
  //   deviceName: 'iPad Air Simulator',
  //   deviceOrientation: 'portrait'
  // },
  // sl_ipad_103: {
  //   base: 'SauceLabs',
  //   browserName: 'ipad',
  //   version: '10.3',
  //   deviceName: 'iPad Pro (9.7 inch) Simulator',
  //   deviceOrientation: 'portrait'
  // },
  // sl_ipad_112: {
  //   base: 'SauceLabs',
  //   browserName: 'ipad',
  //   version: '11.2',
  //   deviceName: 'iPad Pro (12.9 inch) (2nd generation) Simulator',
  //   deviceOrientation: 'portrait'
  // },
  sl_ie_10: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    version: '10'
  },
  sl_ie_11: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11'
  },
  sl_edge_13: {
    base: 'SauceLabs',
    browserName: 'microsoftedge',
    platform: 'Windows 10',
    version: '13'
  },
  sl_edge_14: {
    base: 'SauceLabs',
    browserName: 'microsoftedge',
    platform: 'Windows 10',
    version: '14'
  },
  sl_edge_15: {
    base: 'SauceLabs',
    browserName: 'microsoftedge',
    platform: 'Windows 10',
    version: '15'
  },
  sl_edge_16: {
    base: 'SauceLabs',
    browserName: 'microsoftedge',
    platform: 'Windows 10',
    version: '16'
  },
  sl_safari_7: {
    base: 'SauceLabs',
    browserName: 'safari',
    version: '7'
  },
  sl_safari_8: {
    base: 'SauceLabs',
    browserName: 'safari',
    version: '8'
  },
  sl_safari_9: {
    base: 'SauceLabs',
    browserName: 'safari',
    version: '9'
  },
  sl_safari_10: {
    base: 'SauceLabs',
    browserName: 'safari',
    version: '10'
  },
  sl_safari_latest: {
    base: 'SauceLabs',
    browserName: 'safari',
    version: 'latest'
  },
  sl_android_44: {
    base: 'SauceLabs',
    browserName: 'android',
    version: '4.4',
    deviceName: 'Android Emulator',
    deviceType: 'phone',
    deviceOrientation: 'portrait'
  },
  sl_android_51: {
    base: 'SauceLabs',
    browserName: 'android',
    version: '5.1',
    deviceName: 'Android GoogleAPI Emulator',
    deviceType: 'phone',
    deviceOrientation: 'portrait'
  },
  sl_android_60: {
    base: 'SauceLabs',
    browserName: 'android',
    version: '6.0',
    deviceName: 'Android GoogleAPI Emulator',
    deviceType: 'phone',
    deviceOrientation: 'portrait'
  },
  sl_android_71: {
    base: 'SauceLabs',
    browserName: 'android',
    version: '7.1',
    deviceName: 'Android GoogleAPI Emulator',
    deviceType: 'phone',
    deviceOrientation: 'portrait'
  }
}
