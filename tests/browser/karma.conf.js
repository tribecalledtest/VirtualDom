var path = require('path');

module.exports = function(config) {
    var filesCollection = [
        'public/main.js',
        'tests/browser/**/*.js'
    ];

    var excludeFiles = ['tests/browser/karma.conf.js'];

    config.set({
        plugins : [
            'karma-chai',
            'karma-mocha',
            'karma-sinon',
            'karma-phantomjs-launcher',
            'karma-jquery'
        ],
        browsers : ['PhantomJS'],
        frameworks : ['mocha', 'chai', 'sinon', 'jquery-2.1.0'],
        basePath : path.join(__dirname, '../../'),
        files: filesCollection,
        exclude : excludeFiles,
        run : 'watch',
        port : 1337,
        client : {
            captureConsole: true,
            mocha: {
                bail: true
            }
        }
    });
};