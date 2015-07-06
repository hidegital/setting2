/**************************************************
 * modules laod
 *************************************************/
var gulp       = require( 'gulp' );
var watch      = require( 'gulp-watch' );
var sass       = require( 'gulp-sass' );
//var rubysass   = require( 'gulp-ruby-sass' );
var browserify = require( 'browserify' );
var watchify   = require( 'watchify' );
var uglify     = require( 'gulp-uglify' );
var source     = require( 'vinyl-source-stream' );
var buffer     = require( 'vinyl-buffer' );

/**************************************************
 * path
 *************************************************/
var cssSrcPath        = './src/scss';
var cssDestPath       = './css';
var jsSrcPath         = './src/js';
var jsDestPath        = './js';
var scssPath          = './src/scss';
var bootstrapScssPath = './bootstrap/assets/stylesheets';

/**************************************************
 * tasks
 *************************************************/
/**
 * sass
 */
gulp.task( 'sass', function() {
    return gulp.src( cssSrcPath + '/*.scss' )
        .pipe( sass( {
            outputStyle : 'compressed',
            includePaths: [
                cssSrcPath,
                bootstrapScssPath
            ]
} ) )
.pipe( gulp.dest( cssDestPath ) );
} );

/**
 * rubysass
 */
gulp.task( 'rubysass', function() {
    return rubysass( cssSrcPath, {
        style   : 'compressed',
            loadPath: [
                cssSrcPath,
                bootstrapScssPath
            ]
} )
    .pipe( gulp.dest( cssDestPath ) );
} );

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
    return jscompile( true );
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
gulp.task( 'watch', ['sass', 'watchify'], function() {
    gulp.watch( scssPath + '/*.scss', ['sass'] );
} );