var gulp = require('gulp');
var less = require('gulp-less');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');
var rename = require('gulp-rename');
var flatten = require('gulp-flatten');
var imagemin = require('gulp-imagemin');
var autoprefixer = require('gulp-autoprefixer');
var rigger = require('gulp-rigger');
var inlinesource = require('gulp-inline-source');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');
var ghPages = require('gulp-gh-pages');

gulp.task('templates', function() {
    return gulp.src(['src/templates/**/*.html', '!src/templates/partials/', '!src/templates/partials/**'])
        .pipe(rigger())
        .pipe(gulp.dest('docs/'));
});

gulp.task('styles', function() {
    return gulp.src('src/styles/style.less')
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cssmin({
            rebase: false
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('docs/css/'));
});

gulp.task('scripts', function() {
    return gulp.src('src/scripts/script.js')
        .pipe(sourcemaps.init())
        .pipe(rigger())
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('docs/js/'));
});

gulp.task('fonts', function() {
    return gulp.src([
        'bower_components/**/*.eot',
        'bower_components/**/*.ttf',
        'bower_components/**/*.woff',
        'bower_components/**/*.woff2'
    ])
        .pipe(flatten())
        .pipe(gulp.dest('docs/fonts/'));
});


gulp.task('images', function() {
    return gulp.src(['src/images/**/*.png', 'src/images/**/*.jpg', 'src/images/**/*.svg'])
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            //imageminJpegRecompress({progressive: true, method: 'smallfry', quality: 'veryhigh'}),
            imagemin.optipng(),
            imagemin.svgo({plugins: [{cleanupIDs: false}]})
        ]))
        //.pipe(flatten())
        .pipe(gulp.dest('docs/img/'))
});

gulp.task('copy', function() {
    return gulp.src(['src/CNAME'])
        .pipe(gulp.dest('docs/'));
});

gulp.task('clean', function(){
    return gulp.src('docs/', {read: false})
        .pipe(clean());
});

gulp.task('post-inline', function() {
    return gulp.src('docs/**/*.html')
        .pipe(inlinesource())
        .pipe(gulp.dest('docs/'));
});

gulp.task('default', ['clean'], function() {
    gulp.run([
        'scripts',
        'styles',
        'fonts',
        'images',
        'templates',
        'copy'
    ]);
});

gulp.task('watch', function() {

    gulp.watch('src/styles/**/*.less', ['styles']);
    gulp.watch('src/scripts/**/*.js', ['scripts']);
    gulp.watch('src/templates/**/*.html', ['templates']);
    gulp.watch(['src/images/**/*.png', 'src/images/**/*.jpg', 'src/images/**/*.svg'], ['images']);

});

gulp.task('deploy', function() {

    return gulp.src('docs/**/*')
        .pipe(ghPages({
            force: true
        }));

});