var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
 
gulp.task('html', function() {
  var opts = {
    conditionals: true,
    spare: true,
    comments: true
  };
  return gulp.src('html/index.html')
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('public/'));
});

gulp.task('css', function() {
  return gulp.src('css/*.css')
    .pipe(minifyCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('public/css'));
});

gulp.task('js', function() {
  gulp.src(['js/reconnect.js', 'js/app.js'])
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/assets'))
});

gulp.task('watch:html', ['html'], function() {
  gulp.watch('html/**/*.html', ['html'])
});

gulp.task('watch:css', ['css'], function() {
  gulp.watch('css/**/*.css', ['css'])
});

gulp.task('watch:js', ['js'], function() {
  gulp.watch('js/**/*.js', ['js'])
});
