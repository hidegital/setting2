gulp       = require 'gulp'
watch      = require 'gulp-watch'
fs         = require 'fs'

browserify = require 'browserify'
watchify   = require 'watchify' #browserifyのコンパイルを早くする
uglify     = require 'gulp-uglify' #js圧縮
source     = require 'vinyl-source-stream' #gulp で Browserify を扱う際に利用
buffer     = require 'vinyl-buffer'

browserSync = require 'browser-sync'
reload = browserSync.reload;

data = require 'gulp-data'
plumber = require 'gulp-plumber' #エラー時に止めない

sass = require 'gulp-ruby-sass' #node-sass rubyのsass, stylusとどれ使うか
stylus = require 'gulp-stylus'
pleeease = require 'gulp-pleeease' #autoprefixer
csscomb = require 'gulp-csscomb'
cssmin = require 'gulp-cssmin'
#scsslint = require 'gulp-scss-lint'
csslint = require 'gulp-csslint'
sourcemaps = require 'gulp-sourcemaps'


babelify = require 'babelify'

ejs = require 'gulp-ejs'
htmlhint = require 'gulp-htmlhint'
prettify = require 'gulp-prettify'

sitemap = require 'gulp-sitemap'

del = require 'del'
#runSequence = require 'run-sequence'
header  = require 'gulp-header'

coffee  = require 'gulp-coffee'
concat  = require 'gulp-concat'
uglify  = require 'gulp-uglify'

#imagemin
imagemin = require 'gulp-imagemin'

#AUTOPREFIXER_BROWSERS = [
#    'ie >= 10',
#    'ff >= 30',
#    'chrome >= 34',
#    'safari >= 7',
#    'opera >= 23',
#];

jsSrcPath         = './src/js'
distJs            = './dist/js'
buildJs           = './build/js'
scssPath          = './src/scss'
stylusPath        = './src/stylus'
distCss           = './dist/css'
buildCss          = './build/css'

#bootstrapScssPath = './bootstrap/assets/stylesheets'
srcImg            = './src/img'
#distImg           = './dist/img'
buildImg          = './build/img'

jsonData = require './src/data/index.json'

#json
ejsJson = require 'gulp-ejs-json'

#sprite
spritesmith = require 'gulp.spritesmith'

gutil = require 'gulp-util'
_ = require 'underscore'
DEST = "./dist";
SRC = "./src";


customOpts =
    entries: ["#{SRC}/js/app.js"]
    debug: true
opts = _.extend {}, watchify.args, customOpts
b = watchify browserify(opts)
b.transform 'babelify'
bundle = ->
    b.bundle().on 'error',  gutil.log.bind gutil, 'Browserify Error'
    .pipe source './js/app.js'
    .pipe buffer()
    .pipe gulp.dest DEST
gulp.task 'browserify', bundle
b.on 'update', bundle

gulp.task 'browserify', bundle
b.on 'update', bundle
b.on 'log', gutil.log


paths =
    js: ["#{SRC}/**/*.js"]

#gulp.task 'browserify', ->
#    browserify(debug: true)
#    .transform(babelify)
#    .require('src/js/app.js', entry: true)
#    .bundle()
#    .on('error', (err) ->
#        console.log 'Error: ' + err.message
#        return
#    ).pipe fs.createWriteStream('bundle.js')

gulp.task 'browserSync', ->
    browserSync
        notify: false,
        port: 3000,
        server: {
            baseDir: ['./dist/']
        }

#やはりstylusのがよさそう
gulp.task 'stylus', ->
    gulp.src [stylusPath + '/*.styl','!' + stylusPath + '/_*/*.styl']
    .pipe plumber()
    .pipe sourcemaps.init()
    .pipe stylus()
    .pipe sourcemaps.write()
    .pipe pleeease(
        minifier: false,
        autoprefixer: {"browsers": ["last 4 versions"]}
    )
    .pipe csscomb()
    .on('error', console.error.bind(console))
    .pipe (header('@charset "utf-8";\n'))
    .pipe (gulp.dest('./dist/css/'))
    .on('end', reload);

gulp.task 'sass', ->
    gulp.src ['src/scss/*.scss','!' + 'src/scss/**/_*.scss']
    .pipe plumber()
    .pipe sass()
    .pipe pleeease(
        minifier: false,
        autoprefixer: {"browsers": ["last 4 versions"]}
    )
    .pipe csscomb()
    .pipe(sourcemaps.write())
#    .pipe scsslint()
    .on('error', console.error.bind(console))
    .pipe (header('@charset "utf-8";\n'))
    .pipe (gulp.dest('./dist/css/'))
    .on('end', reload);

gulp.task 'csslint', ->
    gulp.src(distCss + '/*.css')
        .pipe csslint()
        .pipe csslint.reporter()

gulp.task 'ejs', ->
    gulp.src ["src/ejs/**/*.ejs",'!' + "src/ejs/**/_*.ejs"]
    .pipe plumber()
    .pipe ejs()
    .pipe gulp.dest DEST

gulp.task 'htmlhint', ->
    gulp.src('./dist/*.html')
        .pipe htmlhint()
        .pipe htmlhint.reporter()

#sprite
gulp.task 'spriteStylus', ->
    spriteData = gulp.src 'src/img/sprite/*.png'
    .pipe plumber()
    .pipe spritesmith
        imgName: 'sprite.png',
        cssName: 'sprite.styl',
        cssFormat: 'stylus'
    spriteData.img
    .pipe gulp.dest(srcImg +  '/sprite/')
    .pipe gulp.dest('dist/img/')
    spriteData.css
    .pipe gulp.dest(stylusPath + '/_partial');

gulp.task 'spriteSass', ->
    spriteData = gulp.src srcImg + '/sprite/*.png'
    .pipe plumber()
    .pipe spritesmith
        imgName: 'sprite.png',
        cssName: '_sprite.scss',
        cssFormat: 'scss'
    spriteData.img
    .pipe gulp.dest(srcImg + '/sprite/')
    .pipe gulp.dest('dist/img/')
    spriteData.css
    .pipe gulp.dest(scssPath)

#minify系
gulp.task 'imagemin', ->
    dstGlob = buildImg;
    imageminOptions = optimizationLevel: 7
    gulp.src [srcImg + '/**/*.+(jpg|jpeg|png|gif|svg)','!' + srcImg + '/sprite/*.+(jpg|jpeg|png|gif|svg)']
        .pipe imagemin(imageminOptions)
        .pipe gulp.dest(dstGlob)

#concat順番通りになってる？？
gulp.task 'cssmin', ->
    gulp.src [distCss + '/*.css']
        .pipe concat('style.css')
        .pipe cssmin()
        .pipe gulp.dest(buildCss)

gulp.task 'jsmin', ->
    gulp.src [distJs + '/*.js']
        .pipe uglify()
        .pipe gulp.dest(buildJs)

gulp.task 'htmlprettify', ->
    gulp.src(DEST + '/*.html')
        .pipe prettify({indent_size: 2})
        .pipe gulp.dest('./build')


gulp.task 'bsReload', ->
    browserSync.reload

gulp.task 'watch', ->
#    gulp.watch scssPath + '/*.scss', ['sass','csslint','bsReload']
    gulp.watch [stylusPath + '/*.styl',stylusPath + '/_partial/*.styl'], ['stylus','bsReload']
    gulp.watch ['src/ejs/**/*.ejs', 'src/ejs/**/_*.ejs'], ['ejs','htmlhint','bsReload']
    gulp.watch 'src/js/*.js', ['browserify']

#TODO clean dell使う？？ sitemap生成試す
gulp.task 'default', ['watch', 'browserSync']
gulp.task 'lint', ['csslint']
gulp.task 'build', ['imagemin','cssmin','jsmin','htmlprettify']