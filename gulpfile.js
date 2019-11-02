var path = require('path');
var fs = require('fs');
var del = require('del');
var runSequence = require('run-sequence');

var gulp = require('gulp');
var replace = require('gulp-replace');
var fileinclude = require('gulp-file-include');
var pkg = require('./package.json');

var config = {
    src: {
        html: ['./src/**/*.html', '!./src/views/template/**'],
    },
    dist: './dist',
};

gulp.task('build:clean', function() {
    return del([
        config.dist
    ]);
});

gulp.task('build:html', function() {
    return gulp.src(config.src.html)
        .pipe(replace('${name}', pkg.description))
        .pipe(replace('${company}', pkg.company))
        .pipe(replace('${brief}', pkg.name))
        .pipe(replace('${domain}', "/"))
        .pipe(fileinclude())
        .pipe(gulp.dest(config.dist))
    ;
});

gulp.task('copy', function(cb){
    runSequence(
        'copy:assets',
        'copy:favicon',
        cb);
});

gulp.task('copy:assets', function(){
    return gulp.src('src/assets/**/*')
        .pipe(gulp.dest(config.dist + '/assets'))
});

gulp.task('copy:favicon', function(){
    return gulp.src('src/favicon.ico')
        .pipe(gulp.dest(config.dist))
});

gulp.task('build', function(cb) {
    runSequence(
        'build:clean',
        'copy',
        'build:html',
        cb);
});

gulp.task('default', ['build']);