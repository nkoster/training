var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('js', function() {
  gulp.src('js/**/*.js')
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/assets'))
});

gulp.task('watch:js', ['js'], function() {
  gulp.watch('js/**/*.js', ['js'])
});
