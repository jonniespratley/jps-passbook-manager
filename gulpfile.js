'use strict';
const gulp = require('gulp');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');

const config = {
  src: 'lib/**/*.js',
  specs: 'test/specs/*.js'
};

gulp.task('pre-test', () => {
  return gulp.src(config.src)
    .pipe(istanbul({
      includeUntested: true,
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], () => {
  return gulp.src(config.specs)
    .pipe(mocha({
      read: false
    }))
    .pipe(istanbul.writeReports());
});
