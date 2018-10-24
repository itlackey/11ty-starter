
var paths = require('./paths.json');
var config = require('./src/data/config.json');
var path = require('path');
var gulp = require('gulp');
var clean = require('gulp-clean');
var shell = require('gulp-shell');

//var rename = require('gulp-rename');

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var pump = require('pump');

var sass = require('gulp-sass');
var minify = require('gulp-minify-css');
sass.compiler = require('node-sass');

var themePath = path.join(paths.themes.replace('../', ''), config.theme, '/styles');

//#region cleaning

gulp.task('clean:output', () => gulp.src(paths.output, { read: false, allowEmpty: true }).pipe(clean()));

gulp.task('clean:temp', () => gulp.src('./tmp', { read: false, allowEmpty: true }).pipe(clean()));

gulp.task('clean:packages', () => gulp.src('node_modules', { read: false }).pipe(clean()));

gulp.task('clean', gulp.parallel('clean:temp', 'clean:output'));

//#endregion

//#region scripts
// Uglify our javascript files into one.
// Use pump to expose errors more usefully.
gulp.task('scripts:theme', function (done) {
	pump([
		gulp.src(path.join('src', paths.themes.replace('../', ''), config.theme, '/scripts/**/*.js')),
		concat('theme.js'),
		uglify(),
		gulp.dest(path.join(paths.output, 'assets/scripts'))
	], done());
});
gulp.task('scripts:site', function (done) {
	pump([
		gulp.src('src/scripts/**/*.js'),
		concat('app.js'),
		uglify(),
		gulp.dest(path.join(paths.output, 'assets/scripts'))
	], done());
});
gulp.task('scripts:vendor', function (done) {
	//TODO: configure vendor concat
	pump([
		gulp.src('src/lib/**/*.js'),
		concat('vendor.js'),
		uglify(),
		gulp.dest(path.join(paths.output, 'assets/scripts'))
	], done());
});
gulp.task('scripts', gulp.parallel('scripts:site', 'scripts:theme', 'scripts:vendor'));
//#endregion


//#region images
gulp.task('images:theme', function (done) {
	pump([
		//this is ugly, please fix this!
		gulp.src(path.join(paths.themes.replace('../', ''), config.theme, '/images/**/*.{png,svg,jpg,gif}')),
		gulp.dest(path.join(paths.output, 'assets/images'))
	], done());
});
gulp.task('images:site', function (done) {
	pump([
		gulp.src('src/images/**/*.{png,svg,jpg,gif}'),
		gulp.dest(path.join(paths.output, 'assets/images'))
	], done());
});
gulp.task('images', gulp.parallel('images:site', 'images:theme'));
//#endregion


//#region styles
function precompileThemesStyles() {
	var themeScssGlob = path.join(themePath, '/**/*.scss');
	return gulp.src(themeScssGlob, { base: './src' })
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./tmp'));
}
function  precompileSiteStyles() {
	return gulp.src('./src/styles/**/*.scss', { base: './src' })
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./tmp'));
}
function concatThemeStyles() {
	var themeStylesGlob = path.join(themePath, '/**/*.css');
	return gulp.src([themeStylesGlob, './tmp/themes/**/*.css'])
		.pipe(concat('theme.min.css'))
		.pipe(minify({ keepBreaks: true }))
		.pipe(gulp.dest(path.join(paths.output, 'assets/styles')));
}
function concatSiteStyles(){
	return gulp.src(['./src/styles/**/*.css', './tmp/styles/**/*.css'])
		.pipe(concat('site.min.css'))
		.pipe(minify({ keepBreaks: true }))
		.pipe(gulp.dest(path.join(paths.output, 'assets/styles')));
}
function cleanTempThemeStyles(){
	return gulp.src('./tmp/themes/**/styles', { read: false, allowEmpty: true }).pipe(clean());
}
function cleanTempSiteStyles(){
	return gulp.src('./tmp/styles', { read: false, allowEmpty: true }).pipe(clean());
}
gulp.task('styles:theme:precompile', precompileThemesStyles);
gulp.task('styles:theme:concat', concatThemeStyles);
gulp.task('styles:theme:clean', cleanTempThemeStyles);
gulp.task('styles:theme', gulp.series('styles:theme:precompile', 'styles:theme:concat', 'styles:theme:clean'));


gulp.task('styles:site:precompile', precompileSiteStyles);
gulp.task('styles:site:concat', concatSiteStyles);
gulp.task('styles:site:clean', cleanTempSiteStyles);
gulp.task('styles:site', gulp.series('styles:site:precompile', 'styles:site:concat', 'styles:site:clean'));


gulp.task('styles:vendor', function () {
	//TODO: configure library concat
	return gulp.src('src/lib/**/*.css')
		.pipe(concat('vendor.min.css'))
		.pipe(minify({ keepBreaks: true }))
		.pipe(gulp.dest(path.join(paths.output, 'assets/styles')));
});

gulp.task('styles', gulp.parallel('styles:site', 'styles:theme', 'styles:vendor'));
//#endregion


/*
 Run our static site generator to build the pages
*/

gulp.task('generate', shell.task('eleventy --quiet'));

gulp.task('build', gulp.series('clean', gulp.parallel('scripts', 'images', 'styles'), 'generate'));

gulp.task('serve', gulp.series('build'), function (done) {
	done();
});


gulp.task('default', gulp.series('build', 'clean:temp'));