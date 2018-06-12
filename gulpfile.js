const gulp = require('gulp')
const del = require('del')
const Q = require('q')
const util = require('gulp-template-util')
const gcPub = require('gulp-gcloud-publish')

let copyStaticTask = dest => {
  return () => {
    return gulp
      .src(
        ['src/**/*.html', 'src/img/**/*', 'src/css/**/*.css', 'src/lib/**/*'], {
          base: 'src'
        }
      )
      .pipe(gulp.dest(dest))
  }
}

let cleanTask = () => {
  return del(['dist', ''])
}

gulp.task('publish', () => {
  return gulp.src(['dist/**/*'])
    .pipe(gcPub({
      bucket: 'tutor-events',
      keyFilename: './tutor.json',
      projectId: 'tutor-204108',
      base: '/event/resolve',
      public: true,
      transformDestination: path => {
        return path
      },
      metadata: {
        cacheControl: 'max-age=315360000, no-transform, public'
      }
    }))
})

gulp.task('package', () => {
  let deferred = Q.defer()
  Q.fcall(() => {
    return util.logPromise(cleanTask)
  }).then(() => {
    return Q.all([
      util.logStream(copyStaticTask('dist'))
    ])
  })

  return deferred.promise
})
