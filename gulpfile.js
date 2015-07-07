var gulp = require('gulp');
var karma = require('karma').server;
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var runSeq = require('run-sequence');


gulp.task('testBrowserJs', function(done) {
    karma.start({
        configFile : __dirname + '/tests/browser/karma.conf.js'
    }, done);
});

gulp.task('compileJS', function() {
    var b = browserify();
    b.add('./VDOM/workshop.js');

    b.transform(babelify);

    b.bundle()
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./public/'));
});


// ------------------------------------------------------
gulp.task('default', function() {
    runSeq('compileJS', 'testBrowserJs');

    gulp.watch('VDOM/**/*.js', function() {
        runSeq('compileJS');
    });
});

