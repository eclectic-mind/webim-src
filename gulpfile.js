var {
  watch,
  src,
  dest,
  parallel,
  series
} = require("gulp");

var browserSync = require("browser-sync");
var del = require("del");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var pug = require("gulp-pug");
var htmlbeautify = require("gulp-html-beautify");

function devServer(cb) {
  var params = {
    watch: true,
    reloadDebounce: 150,
    notify: false,
    server: {
      baseDir: "./public",
    },
  };

  browserSync.create().init(params);
  cb();
}

function clearBuild() {
  return del("public/");
}

function buildPages() {
  var options = {
    indentSize: 2,
  };

  return src("src/pages/*.pug")
    .pipe(pug())
    .pipe(htmlbeautify(options))
    .pipe(dest("public/"));
}

function buildStyles() {
  return src("src/styles/*.scss")
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest("public/styles/"));
}

function buildAssets(cb) {
  src(["src/assets/**/*.*", "!src/assets/img/**/*.*"]).pipe(
    dest("public/assets/img/")
  );
  src("src/assets/img/**/*.*")
    .pipe(dest("public/assets/img/"));
  cb();
}

function watchFiles() {
  watch(["src/pages/*.pug", "src/pages/parts/*.pug"], buildPages);
  watch("src/styles/*.scss", buildStyles);
  watch("src/assets/**/*.*", buildAssets);
}

function errorHandler(errors) {
  console.warn("Error!");
  console.warn(errors);
}

exports.default = series(
  clearBuild,
  parallel(
    devServer,
    series(
      parallel(buildPages, buildStyles, buildAssets),
      watchFiles
    )
  )
);