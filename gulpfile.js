
var paths = require('./paths.json');
var config = require('./src/data/config.json');
var path = require('path');
var gulp = require('gulp');
var clean = require('gulp-clean');
var shell = require('gulp-shell');

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var pump = require('pump');

var minify = require('gulp-minify-css');

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var fse = require('fs-extra');



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
        gulp.src(path.join("src", paths.themes.replace('../', ''), config.theme, "/scripts/**/*.js")),
        concat('theme.js'),
        uglify(),
        gulp.dest(path.join(paths.output, 'assets/scripts'))
    ], done());
});
gulp.task('scripts:site', function (done) {
    pump([
        gulp.src("src/scripts/**/*.js"),
        concat('app.js'),
        uglify(),
        gulp.dest(path.join(paths.output, 'assets/scripts'))
    ], done());
});
gulp.task('scripts:vendor', function() {
    var bundleFile = browserify()
    .add('src/vendors.js')
    .transform(require('browserify-css'), {
        rootDir: 'src',
        processRelativeUrl: function(relativeUrl) {
            var stripQueryStringAndHashFromPath = function(url) {
                return url.split('?')[0].split('#')[0];
            };
            var rootDir = path.resolve(process.cwd(), 'src');
            var relativePath = stripQueryStringAndHashFromPath(relativeUrl);
            var queryStringAndHash = relativeUrl.substring(relativePath.length);

            //
            // Copying files from '../node_modules/bootstrap/' to 'dist/vendor/bootstrap/'
            //
            var prefix = '../node_modules/';
            if (_.startsWith(relativePath, prefix)) {
                var vendorPath = 'assets/' + relativePath.substring(prefix.length);
                var source = path.join(rootDir, relativePath);
                var target = path.join(rootDir, vendorPath);

                //gutil.log('Copying file from ' + JSON.stringify(source) + ' to ' + JSON.stringify(target));
                fse.copySync(source, target);

                // Returns a new path string with original query string and hash fragments
                return vendorPath + queryStringAndHash;
            }

            return relativeUrl;
        }
    })
    .bundle();

   return bundleFile
        .pipe(source('vendors.js'))
        .pipe(gulp.dest('./dist/assets/scripts'));
});
gulp.task("scripts", gulp.parallel('scripts:site', 'scripts:theme', 'scripts:vendor'));
//#endregion


//#region images
gulp.task('images:theme', function (done) {
    pump([
        //this is ugly, please fix this!
        gulp.src(path.join(paths.themes.replace('../', ''), config.theme, "/images/**/*.{png,svg,jpg,gif}")),
        gulp.dest(path.join(paths.output, 'assets/images'))
    ], done());
});
gulp.task('images:site', function (done) {
    pump([
        gulp.src("src/images/**/*.{png,svg,jpg,gif}"),
        gulp.dest(path.join(paths.output, 'assets/images'))
    ], done());
});
gulp.task('images', gulp.parallel('images:site', 'images:theme'));
//#endregion


//#region styles
gulp.task('styles:theme', function () {
    var themeStylesGlob = path.join("src", paths.themes.replace('../', ''), config.theme, "/styles/**/*.css");
    return gulp.src(themeStylesGlob)
        .pipe(concat('theme.min.css'))
        .pipe(minify({ keepBreaks: true }))
        .pipe(gulp.dest(path.join(paths.output, 'assets/styles')));
});
gulp.task('styles:site', function () {
    return gulp.src("src/styles/**/*.css")
        .pipe(concat('site.min.css'))
        .pipe(minify({ keepBreaks: true }))
        .pipe(gulp.dest(path.join(paths.output, 'assets/styles')));
});
gulp.task('styles:vendor', function () {
     //TODO: configure library concat
    return gulp.src("src/lib/**/*.css")
        .pipe(concat('vendor.min.css'))
        .pipe(minify({ keepBreaks: true }))        
        .pipe(gulp.dest(path.join(paths.output, 'assets/styles')));
});
gulp.task('styles', gulp.parallel('styles:site', 'styles:theme', 'styles:vendor'));
//#endregion


/*
 Run our static site generator to build the pages
*/

gulp.task('generate', shell.task('eleventy'));

gulp.task('build', gulp.series('clean', gulp.parallel('scripts', 'images', 'styles'), 'generate'));

gulp.task('serve', gulp.series('build'), function (done) {
    done();
});


gulp.task('default', gulp.series('build'));


