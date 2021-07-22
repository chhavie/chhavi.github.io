// The require statement tells Node to look into the node_modules folder for a package
// Once the package is found, we assign its contents to the variable
// gulp.src tells the Gulp task what files to use for the task
// gulp.dest tells Gulp where to output the files once the task is completed.

var gulp = require('gulp'),
  browsersync = require('browser-sync').create(),
  sass = require('gulp-sass'),
  del = require('del'),
  panini = require('panini'),
  sourcemaps = require('gulp-sourcemaps'),
  imagemin = require('gulp-imagemin'),
  cache = require('gulp-cache'),
  minify = require('gulp-minify'),
  cssnano = require('gulp-cssnano'),
  autoprefixer = require('gulp-autoprefixer'),
  inject = require('gulp-inject');
//   md5 = require('js-md5');

// const Handlebars = require("handlebars");

// Handlebars.registerHelper('if_eq', function(a, b, opts) {
//   if (a == b) {
//       return opts.fn(this);
//   } else {
//       return opts.inverse(this);
//   }
// });

// Handlebars.registerHelper("lang", function(context, options) {
//   if(context.constructor === Object){
//     return new Handlebars.SafeString('<span class="en">' + context.en + "</span>"+'<span class="hi d-none">' + context.hi + "</span>");
//   }
//   return new Handlebars.SafeString('<span>' + context + "</span>");
// });

// Handlebars.registerHelper("log", function(context, options) {
//   console.log(context, options);
// });


// Handlebars.registerHelper('assign', function (varName, varValue, options) {
//   if (!options.data.root) {
//     options.data.root = {};
//   }
//   options.data.root[varName] = varValue;
// });

// Handlebars.registerHelper('incremented', function (index) {
//   return ++index;
// });

// Handlebars.registerHelper('md5', function (text) {
//   if (text.constructor == Object) {
//     return "c"+ md5(text.en);
//   } else {
//     return "c"+ md5(text);
//   }
// })

// BrowserSync
const browserSync = (done) => {
  browsersync.init({
    server: {
      baseDir: "./docs"
    },
    port: 8000
  });
  done();
}


// BrowserSync Reload
const browserSyncReload = (done) => {
  browsersync.reload();
  done();
}

// Compile SASS into CSS
const sassT = () => {
  return gulp.src(['src/assets/sass/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded',
      sourceComments: 'map',
      sourceMap: 'sass',
      outputStyle: 'nested'
    }).on('error', sass.logError))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(cssnano()) // Use cssnano to minify CSS
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest("docs/assets/css"))
    .pipe(browsersync.stream());
};

const cname = () => {
  return gulp.src('CNAME')
    .pipe(gulp.dest('docs'));
}

// Using panini, template, page and partial files are combined to form html markup
const compileHtml = () => {
  var sources = gulp.src(['./docs/assets/js/*-min.js', './docs/assets/css/*.css'], { read: false });
  return gulp.src('src/pages/**/*.html')
    .pipe(panini({
      root: 'src/pages/',
      layouts: 'src/layouts/',
      partials: 'src/partials/',
      helpers: 'src/helpers/',
      data: 'src/data/'
    }))
    .pipe(inject(sources, { ignorePath: '/docs' }))
    .pipe(gulp.dest('docs'));
};

// Reset Panini's cache of layouts and partials
const resetPages = (done) => {
  panini.refresh();
  console.log('Clearing panini cache');
  done();
};

// ------------ Optimization Tasks -------------
// Copies image files to docs
const images = () => {
  return gulp.src('src/assets/images/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(cache(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 })
    ]))) // Caching images that ran through imagemin
    .pipe(gulp.dest('docs/assets/images/'));
};

const fa = () => {
  return gulp.src('src/assets/css/font-awesome.min.css')
    .pipe(gulp.dest('docs/assets/css/'))
}

const static = () => {
  return gulp.src('src/assets/static/*.*')
    .pipe(gulp.dest('docs/assets/static/'))
}

// Places font files in the docs folder
const font = () => {
  return gulp.src('src/assets/fonts/*.+(eot|woff|ttf|otf|woff2)')
    .pipe(gulp.dest("docs/assets/fonts"))
    .pipe(browsersync.stream());
};

// Concatenating js files
const scripts = () => {
  return gulp.src('src/assets/js/*.js')
    .pipe(sourcemaps.init())
    //If concatenating more than one JS file
    //.pipe(concat('app.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(minify())
    .pipe(gulp.dest('docs/assets/js/'))
    .pipe(browsersync.stream());
};

// Cleaning/deleting files no longer being used in docs folder
const clean = () => {
  console.log('Removing old files from docs');
  return del('docs');
};

// const injectFiles = () => {
//   var target = gulp.src('./docs/*.html');
//   // It's not necessary to read the files (will speed up things), we're only after their paths:
//   var sources = gulp.src(['./docs/assets/js/*.js', './docs/assets/css/*.css'], {read: false});

//   return target.pipe(inject(sources))
//     .pipe(gulp.dest('./docs/src'));
// });

const watchFiles = (done) => {
  gulp.watch('src/assets/js/*', gulp.series(scripts, browserSyncReload));
  gulp.watch('src/assets/images/**/*', images);
  gulp.watch('src/data/*', gulp.series(resetPages, compileHtml, browserSyncReload));
  gulp.watch('src/assets/static/*.*', static);
//   gulp.watch('node_modules/bootstrap/sass/*', gulp.series(sassT, browserSyncReload));
  gulp.watch('src/assets/sass/*', gulp.series(sassT, browserSyncReload));
  gulp.watch('src/assets/sass/**/*', gulp.series(sassT, browserSyncReload));
  gulp.watch('src/**/*.html', gulp.series(resetPages, compileHtml, browserSyncReload));
  done();
}

const watch = gulp.parallel(watchFiles, browserSync);

// ------------ Build Sequence -------------
// Simply run 'gulp' in terminal to run local server and watch for changes
const byd = gulp.series(clean, compileHtml, gulp.parallel(font, sassT, scripts, images,fa, static, resetPages, cname), watch);

// Creates production ready assets in docs folder
const build = gulp.series(clean, gulp.parallel(sassT, scripts, images, fa, static, font, cname), compileHtml);

exports.default = byd;
exports.build = build;
