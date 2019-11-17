const path = require('path');
const fs = require('fs');
const del = require('del');
const runSequence = require('run-sequence');

const gulp = require('gulp');
const replace = require('gulp-replace');
const fileinclude = require('gulp-file-include');
//const browserify = require("gulp-browserify");
const babelify = require("babelify");
const bro = require("gulp-bro");
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const inject = require('gulp-inject');

const pkg = require('./package.json');

const config = {
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

gulp.task('browserify', function(){
    gulp.src(['mock/index.js'])
        .pipe(bro({
            transform: [
                babelify.configure({ presets: ['@babel/env'] }),
                'require-globify'
            ]
        }))
        .pipe(uglify())
        .pipe(rename('mock.min.js'))
        .pipe(gulp.dest(config.dist + "/assets/js"))
});

gulp.task('inject-mock', function(){
    const target = gulp.src([config.dist + "/index.html", config.dist + "/login.html"]);
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    const sources = gulp.src([config.dist + "/assets/js/mock.min.js"], {read: false});

    return target.pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest(config.dist));
});

gulp.task('build:mock', function(cb) {
    runSequence('build:clean', 'copy', 'browserify', 'build:html', 'inject-mock',  cb);
});

gulp.task('default', ['build']);
