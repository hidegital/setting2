gulp       = require 'gulp'
watch      = require 'gulp-watch'
fs         = require 'fs'

browserify = require 'browserify'
watchify   = require 'watchify' #browserifyのコンパイルを早くする
uglify     = require 'gulp-uglify'
source     = require 'vinyl-source-stream' #gulp で Browserify を扱う際に利用
buffer     = require 'vinyl-buffer'

browserSync = require 'browser-sync'
reload = browserSync.reload;

data = require 'gulp-data'
plumber = require 'gulp-plumber' #エラー時に止めない

sass = require 'gulp-sass' #node-sass rubyのsass, stylusとどれ使うか
stylus = require 'gulp-stylus'
pleeease = require 'gulp-pleeease' #autoprefixer
csscomb = require 'gulp-csscomb'
cssmin = require 'gulp-cssmin'

ejs = require 'gulp-ejs'

sitemap = require 'gulp-sitemap'

del = require 'del'
#runSequence = require 'run-sequence'
header  = require 'gulp-header'

coffee  = require 'gulp-coffee'
concat  = require 'gulp-concat'
uglify  = require 'gulp-uglify'

AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
];

cssSrcPath        = './src/scss'
cssDestPath       = './css'
jsSrcPath         = './src/js'
jsDestPath        = './js'
scssPath          = './src/scss'
stylusPath        = './src/stylus'
bootstrapScssPath = './bootstrap/assets/stylesheets'

jsonData = require './src/data/index.json'

#json
ejsJson = require 'gulp-ejs-json'

#sprite
spritesmith = require 'gulp.spritesmith'

gutil = require 'gulp-util'
_ = require 'underscore'
DEST = "./dist";
SRC = "./src";



#
#customOpts =
#    entries: ["#{SRC}/app.js"]
#    debug: true
#opts = _.extend {}, watchify.args, customOpts
#b = watchify browserify(opts)
#b.transform 'babelify'
#bundle = ->
#    b.bundle().on 'error',  gutil.log.bind gutil, 'Browserify Error'
#    .pipe source './js/app.js'
#    .pipe buffer()
#    .pipe gulp.dest DEST
#gulp.task 'browserify', bundle
#b.on 'update', bundle
#
#gulp.task 'browserify', bundle
#b.on 'update', bundle
#b.on 'log', gutil.log


paths =
    js: ["#{SRC}/**/*.js"]

gulp.task 'browserify', ->
    browserify 'src/js/app.js', debug: true
      .transform 'babelify'
      .pipe source 'dist/js/app.js'
      .pipe gulp.dest 'dist/js/app.js'

gulp.task 'browserSync', ->
    browserSync
        notify: false,
        port: 3000,
        server: {
            baseDir: ['./dist/']
        }



gulp.task 'stylus', ->
    gulp.src ['src/stylus/*.styl','src/stylus/**/_*.styl']
    .pipe plumber()
    .pipe stylus()
    .pipe pleeease(
        minifier: false,
        autoprefixer: {"browsers": ["last 4 versions"]}
    )
    .on('error', console.error.bind(console))
    .pipe (header('@charset "utf-8";\n'))
    .pipe (gulp.dest('./dist/css/'))
    .on('end', reload);

gulp.task 'sass', ->
    gulp.src ['src/scss/*.scss','src/scss/**/_*.scss']
    .pipe plumber()
    .pipe stylus()
    .pipe pleeease(
        minifier: false,
        autoprefixer: {"browsers": ["last 4 versions"]}
    )
    .on('error', console.error.bind(console))
    .pipe (header('@charset "utf-8";\n'))
    .pipe (gulp.dest('./dist/css/'))
    .on('end', reload);

gulp.task 'ejs', ->
    gulp.src ["src/ejs/**/*.ejs",'!' + "src/ejs/**/_*.ejs"]
    .pipe plumber()
    .pipe ejs()
    .pipe gulp.dest DEST

gulp.task 'spriteStylus', ->
    spriteData = gulp.src 'src/img/sprite/*.png'
    .pipe plumber()
    .pipe spritesmith
        imgName: 'sprite.png',
        cssName: '_sprite.styl',
    #        imgPath: 'dist/img/sprite/sprite.png',
        cssFormat: 'stylus'
    spriteData.img
    .pipe(gulp.dest('src/img/sprite/'))
    .pipe(gulp.dest('dist/img/'));
    spriteData.css
    .pipe(gulp.dest('src/stylus/'));


gulp.task 'spriteSass', ->
    spriteData = gulp.src 'src/img/sprite/*.png'
    .pipe plumber()
    .pipe spritesmith
        imgName: 'sprite.png',
        cssName: '_sprite.styl',
    #        imgPath: 'dist/img/sprite/sprite.png',
        cssFormat: 'sass'
    spriteData.img
    .pipe(gulp.dest('src/img/sprite/'))
    .pipe(gulp.dest('dist/img/'));
    spriteData.css
    .pipe(gulp.dest('src/scss/'));


gulp.task 'bsReload', ->
    browserSync.reload
#gulp.task 'watch', ->
#    gulp.watch stylusPath + '/*.styl', ['stylus','bsReload']
gulp.task 'watch', ->
    gulp.watch scssPath + '/*.scss', ['sass','bsReload']
    gulp.watch ['src/ejs/**/*.ejs', 'src/ejs/**/_*.ejs'], ['ejs','bsReload']
    gulp.watch 'src/js/*.js', ['browserify']

gulp.task 'default', ['watch', 'browserSync']