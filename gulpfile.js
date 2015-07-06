var gulp       = require( 'gulp' );
var watch      = require( 'gulp-watch' );

var browserify = require( 'browserify' );
var watchify   = require( 'watchify' );//browserifyのコンパイルを早くする
var uglify     = require( 'gulp-uglify' );
var source     = require( 'vinyl-source-stream' );
var buffer     = require( 'vinyl-buffer' );

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var data = require('gulp-data');
var plumber = require('gulp-plumber'); //エラー時に止めない

var sass = require('gulp-sass');//node-sass rubyのsass, stylusとどれ使うか
var stylus = require('gulp-stylus');
var pleeease = require('gulp-pleeease');
var csscomb = require('gulp-csscomb');
var cssmin = require('gulp-cssmin');

var ejs = require('gulp-ejs');

var sitemap = require('gulp-sitemap');

var del = require('del');
//var runSequence = require('run-sequence');
var header  = require('gulp-header');

var coffee  = require('gulp-coffee');
var concat  = require('gulp-concat');
var uglify  = require('gulp-uglify');

var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
];

var cssSrcPath        = './src/scss';
var cssDestPath       = './css';
var jsSrcPath         = './src/js';
var jsDestPath        = './js';
var scssPath          = './src/scss';
var stylusPath          = './src/stylus';
//var bootstrapScssPath = './bootstrap/assets/stylesheets';

//＠TODO babel,sprite,ejs

/**
 * sass
 */
gulp.task('sass', function () {
    gulp.src(['src/scss/*.scss','src/scss/**/_*.scss'])
        .pipe(plumber())
        .pipe(sass())
        .pipe(pleeease({
            minifier: false,
            autoprefixer: AUTOPREFIXER_BROWSERS
            //autoprefixer: {"browsers": ["last 4 versions"]}
        }))
        .on('error', console.error.bind(console))
        .pipe(header('@charset "utf-8";\n'))
        .pipe(gulp.dest('./dist/'))
        .on('end', reload);
});

/*stylus*/
gulp.task('stylus', function () {
    gulp.src(['src/stylus/*.styl','src/stylus/**/_*.styl'])
        .pipe(plumber())
        .pipe(stylus())
        .pipe(pleeease({
            minifier: false,
            autoprefixer: {"browsers": ["last 4 versions"]}
        }))
        .on('error', console.error.bind(console))
        .pipe(header('@charset "utf-8";\n'))
        .pipe(gulp.dest('./dist/css/'))
        .on('end', reload);
});

/*ejs*/
gulp.task('ejs', function() {
    gulp.src(
        ["src/ejs/**/*.ejs",'!' + "src/ejs/**/_*.ejs"]//「’!’ + “app/dev/ejs/**/_*.ejs”」の部分で、「_(アンダーバー)で始まるejsファイルは参照しない
    )
        .pipe(ejs())
        .pipe(gulp.dest('./dist/'))
});



/**
 * browserify
 */
gulp.task( 'browserify', function() {
    return jscompile( false );
} );

/**
 * watchify
 */
gulp.task( 'watchify', function() {
    return jscompile( false );
} );

function jscompile( is_watch ) {
    var bundler;
    if ( is_watch ) {
        bundler = watchify( browserify( jsSrcPath + '/app.js' ) );
    } else {
        bundler = browserify( jsSrcPath + '/app.js' );
    }

    function rebundle() {
        return bundler
            .bundle()
            .pipe( source( 'app.js' ) )
            .pipe( buffer() )
            .pipe( uglify() )
            .pipe( gulp.dest( jsDestPath ) );
    }
    bundler.on( 'update', function() {
        rebundle();
    } );
    bundler.on( 'log', function( message ) {
        console.log( message );
    } );
    return rebundle();
}


/**
 * watch
 */
//sass
//gulp.task( 'watch', ['sass', 'watchify'], function() {
//    gulp.watch( scssPath + '/*.scss', ['sass'] );
//} );

gulp.task( 'bsReload', function() {
    browserSync.reload()
} );

//watch
gulp.task( 'watch', ['stylus', 'watchify','ejs'], function() {
    gulp.watch( stylusPath + '/*.styl', ['stylus','bsReload'] );
    gulp.watch(["src/ejs/**/*.ejs", "src/ejs/**/_*.ejs"],['ejs','bsReload']);
} );

gulp.task('default',['watch'], function () {
    browserSync({
        notify: false,
        port: 3000,
        server: {
            baseDir: ['./dist/']
        }
    });
    //gulp.watch(['./src/scss/*.scss','./src/scss/**/_*.scss'],['sass']);
    //gulp.watch(["src/ejs/*.ejs","src/ejs/**/_*.ejs"],['ejs']);
    //gulp.watch(['./src/coffee/*.coffee','./src/coffee/**/_*.coffee'],['coffee']);
    //gulp.watch(['./src/js/*.js'],['compile-js']);
});

gulp.task('clean', function(cb) {
    del(['./dist/**/*.html','./dist/**/*.css','./dist/**/*.xml'], cb);
});
