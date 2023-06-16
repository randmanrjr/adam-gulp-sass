'use strict';

var $           = require('gulp-load-plugins')();
var argv        = require('yargs').argv;
var gulp        = require('gulp');
var merge       = require('merge-stream');
var sequence    = require('run-sequence');
var ftp         = require('vinyl-ftp');
var notify      = require('gulp-notify');
var gutil       = require('gulp-util');
var sass        = require('gulp-sass');


// Copy task -- run this task once to copy all the Slick assets to the correct locations
gulp.task('copy', function() {
    //Slick Fonts
    var slickFonts = gulp.src('node_modules/slick-carousel/slick/fonts/**/*.*')
        .pipe(gulp.dest('css/fonts'))

    //Slick gifs
    var slickGifs = gulp.src('node_modules/slick-carousel/slick/*.gif')
        .pipe(gulp.dest('css'))

    //Slick Fonts
    var slickScss = gulp.src('node_modules/slick-carousel/slick/*.scss')
        .pipe(gulp.dest('src/scss/third-party'))

    //Slick Javascript
    var slickJs = gulp.src('node_modules/slick-carousel/slick/*.js')
        .pipe(gulp.dest('js/vendor'))

    return merge(slickFonts, slickGifs, slickScss, slickJs);
});

gulp.task('sass', function () {
    return gulp.src('./src/scss/main.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});

gulp.task('sass:watch', function () {
    gulp.watch('./scss/**/*.scss', ['sass']);
});

// **Warning** Do not commit user credentials to public repositories!!

var HOST          = ''; //enter url for ftp target
var USERNAME      = ''; //enter ftp username
var PWD           = ''; //enter ftp password
var THEMEPATH     = ''; //change this PATH if it is different on your webserver; this is where you want your css file uploaded
var PORT          = '22'

//Upload css task
gulp.task('upload:css', function () {
    var conn = ftp.create({
        host:       HOST,
        user:       USERNAME,
        password:   PWD,
        parallel:   10,
        log:        gutil.log,
        secure:     true,
        port:       PORT
    });

    var globs = [
        'css/main.css'
    ];

    return gulp.src(globs, {base: '.', buffer: false})
        .pipe(conn.newer(THEMEPATH))
        .pipe(conn.dest(THEMEPATH))
        .pipe(notify({message: 'CSS uploaded to Web Server!', onLast: true}));
});

gulp.task('deploy:css', function (done) {
    sequence('sass', 'upload:css', done);
});

gulp.task('watch:scss:deploy', function () {
    gulp.watch(['./src/scss/**/*.scss'],['deploy:css']);
});