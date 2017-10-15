// Karma configuration
// Generated on Tue Oct 03 2017 13:01:40 GMT-0700 (PDT)

var local = false

module.exports = function(config) {
  var browsers
  var reporters

  switch (process.env.TEST_ENV) {
    case 'browser':
      browsers = Object.keys(customLaunchers)
      reporters = ['dots', 'saucelabs']
      process.env.NODE_ENV = 'production'
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
    files: [
      'src/*.js',
      'test/unit.js'
    ],

    webpack: { // kind of a copy of your webpack config
      devtool: 'inline-source-map', // just do inline source maps instead of the default
      module: {
        loaders: [{
          test: /(\.js|\.jsx)$/,
          exclude: /\/node_modules\//,
          loader: 'babel-loader',
          query: {
            presets: ['env', 'react'],
            plugins: ['transform-object-rest-spread', 'transform-class-properties'],
          },
        }],
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
      'test/unit.js': ['webpack', 'sourcemap']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: reporters,

    // reporters: ['tap-pretty'],
    // tapReporter: {
    //   prettify: require('faucet'), // default 'standard TAP' output 
    //   separator: '****************************'
    // },

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
      testName: 'Alfa browser tests',
      recordVideo: true,
      recordScreenshots: true,
    // connectOptions: {
    //   port: 5757,
    //   logfile: 'sauce_connect.log'
    // },
    // public: 'public'
    },
    captureTimeout: 180 * 1000,
    browserNoActivityTimeout: 90 * 1000,
    browserDisconnectTimeout: 30 * 1000,
    browserDisconnectTolerance: 3,
    browsers: browsers,
    customLaunchers: !local && customLaunchers,


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: !local,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 2
  })
}

// Browsers to run on Sauce Labs
// Check out https://saucelabs.com/platforms for all browser/OS combos
var customLaunchers = {
  // sl_chrome_old: {
  //   base: 'SauceLabs',
  //   browserName: 'chrome',
  //   version: '50'
  // },
  sl_chrome_latest: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'OS X 10.12',
    version: 'latest'
  },
  // sl_firefox_old: {
  //   base: 'SauceLabs',
  //   browserName: 'firefox',
  //   platform: 'Windows 8.1',
  //   version: '40'
  // },
  sl_firefox_latest: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'latest'
  },
  // IE 11 has bugs.
  // sl_ie_11: {
  //   base: 'SauceLabs',
  //   browserName: 'internet explorer',
  //   platform: 'Windows 8.1',
  //   version: '11'
  // },
  sl_edge: {
    base: 'SauceLabs',
    browserName: 'microsoftedge',
    platform: 'Windows 10',
    version: '15'
  },
// sl_safari: {
//   base: 'SauceLabs',
//   browserName: 'safari',
//   version: 'latest'
// },
// sl_iphone_old: {
//   base: 'SauceLabs',
//   browserName: 'iphone',
//   version: '8.1',
//   deviceName: 'iPhone 6 Plus',
//   deviceOrientation: 'portrait'
// },
// sl_iphone_latest: {
//   base: 'SauceLabs',
//   browserName: 'iphone',
//   version: 'latest',
//   deviceName: 'iPhone 7 Plus',
//   deviceOrientation: 'portrait'
// },
// sl_android_latest: {
//   base: 'SauceLabs',
//   browserName: 'android',
//   version: 'latest',
//   deviceName: 'Android Emulator',
//   deviceType: 'phone',
//   deviceOrientation: 'portrait'
// }
}
