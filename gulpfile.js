
var paths = require('./paths.json');
var config = require('./src/data/config.json');
var path = require('path');
var gulp = require('gulp');
var clean = require('gulp-clean');
var shell = require('gulp-shell');

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var pump = require('pump');


//#region cleaning
gulp.task('clean', function () {
    return gulp.src(paths.output, { read: false, allowEmpty: true }).pipe(clean());
});

gulp.task('clean-node-modules', function () {
    return gulp.src("node_modules", { read: false }).pipe(clean());
});
//#endregion

//#region scripts
// Uglify our javascript files into one.
// Use pump to expose errors more usefully.
gulp.task('scripts:theme', function (done) {
    pump([
        gulp.src(path.join(paths.themes, config.theme, "/scripts/**/*.js")),
        concat('theme.js'),
        uglify(),
        gulp.dest(path.join(paths.output, 'assets/js'))
    ], done());
});
gulp.task('scripts:site', function (done) {

    pump([
        gulp.src("src/scripts/**/*.js"),
        concat('app.js'),
        uglify(),
        gulp.dest(path.join(paths.output, 'assets/js'))
    ], done());
});
gulp.task("scripts", gulp.parallel('scripts:site', 'scripts:theme'));
//#endregion


//#region images
gulp.task('images:theme', function (done) {
    pump([
        gulp.src(path.join(paths.themes, config.theme, "/images/**/*.svg")),
        gulp.dest(path.join(paths.output, 'assets/images'))
    ], done());
});
gulp.task('images:site', function (done) {
    pump([
        gulp.src("src/images/**/*.svg"),
        gulp.dest(path.join(paths.output, 'assets/images'))
    ], done());
});
gulp.task('images', gulp.parallel('images:site', 'images:theme'));
//#endregion


//#region styles
gulp.task('styles:theme', function (done) {
    pump([
        gulp.src(path.join(paths.themes, config.theme, "/images/**/*.svg")),
        gulp.dest(path.join(paths.output, 'assets/images'))
    ], done());
});
gulp.task('styles:site', function (done) {
    pump([
        gulp.src("src/images/**/*.svg"),
        gulp.dest(path.join(paths.output, 'assets/images'))
    ], done());
});
gulp.task('styles', gulp.parallel('styles:site', 'styles:theme'));
//#endregion


/*
 Run our static site generator to build the pages
*/

gulp.task('generate', shell.task('eleventy'));

gulp.task('build', gulp.series('clean', gulp.parallel('scripts', 'images', 'styles'), 'generate'));

gulp.task('serve', gulp.series('build'), function(done){
    done();
});


gulp.task('default', gulp.series('build'));


