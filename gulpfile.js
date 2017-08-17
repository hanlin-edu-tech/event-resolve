var gulp = require("gulp");
var rename = require("gulp-rename");
var fs = require("fs");
var es = require("event-stream");
var del = require("del");
var path = require("path");
var Q = require("q");
var util = require("gulp-template-util");

function buildStyle() {
  console.log(
    "==============================================================> func buildStyle() sucessful"
  );
  return es.map(function(file, cb) {
    less.render(
      file.contents.toString(),
      {
        paths: [],
        filename: file.path,
        compress: false
      },
      function(error, result) {
        if (error != null) {
          console.log(error);
          throw error;
        }
        file.contents = new Buffer(result.css);
        cb(null, file);
      }
    );
  });
}

function libTask(dest) {
  console.log(
    "==============================================================> func libTask() sucessful"
  );
  return function() {
    var packageJson = JSON.parse(
      fs.readFileSync("package.json", "utf8").toString()
    );
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    var webLibModules = [];
    for (var module in packageJson.dependencies) {
      webLibModules.push("node_modules/" + module + "/**/*");
    }
    return gulp
      .src(webLibModules, { base: "node_modules/" })
      .pipe(gulp.dest(dest));
  };
}

function copyStaticTask(dest) {
  console.log(
    "==============================================================> func copyStaticTask() sucessful"
  );
  return function() {
    return gulp
      .src(
        ["src/**/*.html", "src/img/**/*", "src/css/**/*.css", "src/lib/**/*"],
        {
          base: "src"
        }
      )
      .pipe(gulp.dest(dest));
  };
}

function cleanTask() {
  console.log(
    "==============================================================> func cleanTask sucessful"
  );
  return del(["dist", ""]);
}

gulp.task("lib", libTask("src/lib"));
gulp.task("build", ["style", "lib"]);

gulp.task("package", function() {
  var deferred = Q.defer();
  Q.fcall(function() {
    return util.logPromise(cleanTask);
  }).then(function() {
    return Q.all([
      util.logStream(libTask("dist/lib")),
      util.logStream(copyStaticTask("dist")),
      util.logStream(styleTask("dist/css"))
    ]);
  });

  return deferred.promise;
});
