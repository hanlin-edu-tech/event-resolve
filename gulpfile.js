var gulp = require('gulp')
var fs = require('fs')
var del = require('del')
var Q = require('q')
var util = require('gulp-template-util')

function libTask (dest) {
  return function () {
    var packageJson = JSON.parse(
      fs.readFileSync('package.json', 'utf8').toString()
    )
    if (!packageJson.dependencies) {
      packageJson.dependencies = {}
    }
    var webLibModules = []
    for (var module in packageJson.dependencies) {
      webLibModules.push('node_modules/' + module + '/**/*')
    }
    return gulp
      .src(webLibModules, { base: 'node_modules/' })
      .pipe(gulp.dest(dest))
  }
}

function copyStaticTask (dest) {
  return function () {
    return gulp
      .src(
        ['src/**/*.html', 'src/img/**/*', 'src/css/**/*.css', 'src/lib/**/*'],
      {
        base: 'src'
      }
      )
      .pipe(gulp.dest(dest))
  }
}

function cleanTask () {
  return del(['dist', ''])
}

gulp.task('lib', libTask('src/lib'))
gulp.task('build', ['style', 'lib'])

gulp.task('package', function () {
  var deferred = Q.defer()
  Q.fcall(function () {
    return util.logPromise(cleanTask)
  }).then(function () {
    return Q.all([
      util.logStream(libTask('dist/lib')),
      util.logStream(copyStaticTask('dist'))
    ])
  })

  return deferred.promise
})
