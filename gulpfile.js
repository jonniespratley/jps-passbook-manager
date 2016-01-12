'use strict';
const gulp = require('gulp');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');

const config = {
  src: [
    'lib/**/*.js',
    'routes/**/*.js'
  ],
  specs: 'test/specs/*.js'
};

gulp.task('pre-test', function() {
  return gulp.src(config.src)
    .pipe(istanbul({
      includeUntested: true,
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function() {
  return gulp.src(config.specs)
    .pipe(mocha({
      read: false
    }))
    .pipe(istanbul.writeReports())
    .once('error', function() {
      process.exit(1);
    })
    .once('end', function() {
      process.exit();
    });
});



gulp.task('default', ['test']);
