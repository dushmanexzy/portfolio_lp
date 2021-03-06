"use strict";

const gulp = require('gulp');

const sass = require('gulp-sass');
const concat = require('gulp-concat');
const server = require('browser-sync').create();
const clean = require('gulp-clean');
const notify = require('gulp-notify');
const rename = require('gulp-rename');

const minifyCss = require('gulp-clean-css');

const uglify = require('gulp-uglify');

const htmlMin = require('gulp-htmlmin');

const imageMin = require("gulp-imagemin");
const tinymin = require('gulp-tinypng');
const webp = require("gulp-webp");

const typeOfCompression = 4;
const qualityOfImage = 75;

const path = {
  cssSrc: [
    './src/css/**/*.css'
  ],

  jsSrc: [
    './src/js/**/*.js'
  ]
}

// CLEAN BUILD W/O FONTS AND IMAGES
function del() {
  return gulp.src(['build/*', '!build/fonts', '!build/img'], {
    read: false
  })
    .pipe(clean())
}

// COPY FONTS AND IMAGES
function copy() {
  return gulp.src([
    'src/fonts/*',
    'src/img/*'
  ], {
    base: 'src'
  })
    .pipe(gulp.dest('build'));
}

// HTML
function html() {
  return gulp.src('src/*.html')
    .pipe(htmlMin())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('build'))
    .pipe(server.stream())
}

// SCSS
function styles() {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sass().on("error", notify.onError()))
    .pipe(gulp.dest('src/css'))
    .pipe(server.stream())
}

// CSS
function buildStyles() {
  return gulp.src(path.cssSrc)
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./build/css'))
    .pipe(minifyCss())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./build/css'))
    .pipe(server.stream())
}

// JS
function scripts() {
  return gulp.src(path.jsSrc)
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./build/js'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'))
    .pipe(server.stream())
}

// trDJqH71snq3PZqlpMlJ8smfXYvWgynf

// OPTIMIZATION PNG and JPG TO BUILD
function tinypngImg () {
  return gulp.src('src/img/*.{png,jpg}')
    .pipe(tinymin('trDJqH71snq3PZqlpMlJ8smfXYvWgynf'))
    .pipe(gulp.dest('build/img'));
};

// OPTIMIZATION IMAGES TO SRC
function images() {
  return gulp.src("src/images/**/*.{png,jpg}")
    .pipe(imageMin([
      imageMin.optipng({ optimizationLevel: typeOfCompression }),
      imageMin.mozjpeg({ quality: qualityOfImage, progressive: true }),
      imageMin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(gulp.dest("src/img"));
};

// COVERTATION WEBP
function webpImg() {
  return gulp.src("build/img/*.{png,jpg}")
    .pipe(webp({
      quality: 95,
      lossless: true
    }))
    .pipe(gulp.dest("build/img/webp"));
};

// WATCHER
function watch() {
  server.init({
    server: "build/",
    index: 'index.min.html',
    browser: 'chrome'
  });

  gulp.watch('./src/scss/**/*.scss', gulp.series(styles, buildStyles));
  gulp.watch('./src/js/**/*.js', scripts);
  gulp.watch('./src/*.html').on('change', gulp.series(html, server.reload));
}


// TASKS
gulp.task('imgOptim', gulp.series(images, tinypngImg, webpImg));

gulp.task('default', gulp.series(del, copy, gulp.parallel(gulp.series(styles, buildStyles), scripts), html, watch)); //scripts