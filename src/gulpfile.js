var DEST, SRC, _, b, browserSync, browserify, buffer, bundle, customOpts, gulp, gutil, mocha, opts, paths, plumber, source, watchify;

var gulp       = require( 'gulp' );
var watch      = require( 'gulp-watch' );
//var fs         = require('fs');

var fs = require("fs");
var browserify = require("browserify");
var babelify = require("babelify");

//var watchify   = require( 'watchify' );//browserifyのコンパイルを早くする
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

//var jsonData = require('./src/data/index.json');

//json
var ejsJson = require('gulp-ejs-json');

//sprite
var spritesmith = require('gulp.spritesmith');

gutil = require('gulp-util');
_ = require('underscore');
DEST = "./dist";
SRC = "./src";

//＠TODO json,min

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
    //var json = JSON.parse(fs.readFileSync("./src/json/index.json"));
    gulp.src(
        ["src/ejs/**/*.ejs",'!' + "src/ejs/**/_*.ejs"]//「’!’ + “app/dev/ejs/**/_*.ejs”」の部分で、「_(アンダーバー)で始まるejsファイルは参照しない
    )
        .pipe(ejs())
        .pipe(gulp.dest('./dist/'))
});
//
//browserify({ debug: true })
//    .transform(babelify)
//    .require("./src/js/app.js", { entry: true })
//    .bundle()
//    .on("error", function (err) { console.log("Error: " + err.message); })
//    .pipe(fs.createWriteStream("bundle.js"));

//var babelify = require('babelify');
//var browserify = require('browserify');
//var source = require('vinyl-source-stream');

gulp.task('modules', function() {
    browserify({
        entries: './js/app.js',
        debug: true
    })
        .transform(babelify)
        .bundle()
        .pipe(source('output.js'))
        .pipe(gulp.dest('./dist'));
});

//sprite stylus
gulp.task('sprite', function () {
    var spriteData = gulp.src('src/img/sprite/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: '_sprite.styl',
        //imgPath: 'dist/img/sprite/sprite.png',
        cssFormat: 'stylus',
        cssVarMap: function (sprite) {
            sprite.name = 'sprite-' + sprite.name;
        }
    }));

    spriteData.img
        .pipe(gulp.dest('src/img/sprite/'))
        .pipe(gulp.dest('dist/img/'));

    spriteData.css
        .pipe(gulp.dest('src/stylus/'));
});
//gulp.task('sprite', function () {
//    var spriteData = gulp.src('src/img/sprite/*.png') //スプライトにする愉快な画像達
//        .pipe(spritesmith({
//            imgName: 'sprite.png', //スプライトの画像
//            cssName: '_sprite.scss', //生成されるscss
//            imgPath: '/img/sprite.png', //生成されるscssに記載されるパス
//            cssFormat: 'scss', //フォーマット
//            cssVarMap: function (sprite) {
//                sprite.name = 'sprite-' + sprite.name; //VarMap(生成されるScssにいろいろな変数の一覧を生成)
//            }
//        }));
//    spriteData.img.pipe(gulp.dest('src/img/')); //imgNameで指定したスプライト画像の保存先
//    spriteData.css.pipe(gulp.dest('src/scss/')); //cssNameで指定したcssの保存先
//});

gulp.task( 'bsReload', function() {
    browserSync.reload()
} );

/**
 * watch
 */
//sass
//gulp.task( 'watch', ['sass', 'watchify'], function() {
//    gulp.watch( scssPath + '/*.scss', ['sass'] );
//} );


//watch
gulp.task( 'watch', ['stylus', 'modules','ejs'], function() {
    gulp.watch( stylusPath + '/*.styl', ['stylus','bsReload'] );
    gulp.watch(["src/ejs/**/*.ejs", "src/ejs/**/_*.ejs"],['ejs','bsReload']);
    gulp.watch("src/js/*.js", ['modules','bsReload'] );
} );

gulp.task('default',['watch'], function () {
    browserSync({
        notify: false,
        port: 3000,
        server: {
            baseDir: ['./dist/']
        }
    });
    //return gulp.src('data/index.json');

    //gulp.watch(['./src/scss/*.scss','./src/scss/**/_*.scss'],['sass']);
    //gulp.watch(["src/ejs/*.ejs","src/ejs/**/_*.ejs"],['ejs']);
    //gulp.watch(['./src/coffee/*.coffee','./src/coffee/**/_*.coffee'],['coffee']);
    //gulp.watch(['./src/js/*.js'],['compile-js']);
});

/*distファイル削除*/
gulp.task('clean', function(cb) {
    del(['./dist/**/*.html','./dist/**/*.css','./dist/**/*.xml'], cb);
});


//gulp.task('test', function() {
//    return gulp.src("./test/**/*.js").pipe(mocha({
//        reporter: 'spec'
//    }));
//});

//gulp.task('watch', function() {
//    gulp.watch(paths.js, ['browserify']);
//    return gulp.watch(paths.reload, function() {
//        return browserSync.reload({
//            once: true
//        });
//    });
//});

//gulp.task('default', ['watch', 'browserSync']);