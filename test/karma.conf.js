module.exports = function(config) {
  config.set({
    basePath: '..',
    frameworks: ['mocha', 'sinon-chai'],
    files: [
      'event-emitter.js',
      'test/event-emitter.spec.js'
    ],
    exclude: [],
    preprocessors: {
      'event-emitter.js': 'coverage'
    },
    reporters: ['mocha', 'coverage'],
    coverageReporter: {
      dir : 'coverage/',
      reporters: [
        { type: 'html', subdir: 'report-html' },
        { type: 'lcov', subdir: 'report-lcov' }
      ]
    },
    plugins: [
      'karma-coverage',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-phantomjs-launcher',
      'karma-sinon-chai'
    ],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: false,
    concurrency: Infinity
  });
};
