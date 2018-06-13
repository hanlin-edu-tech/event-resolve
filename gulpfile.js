const gulp = require('gulp')
const del = require('del')
const Q = require('q')
const util = require('gulp-template-util')
const gcPub = require('gulp-gcloud-publish')
const Storage = require('@google-cloud/storage')

let bucketName = 'tutor-events'
let projectId = 'tutor-204108'
let keyFilename = './tutor.json'
let projectName = 'resolve'

const storage = new Storage({
  projectId: projectId,
  keyFilename: keyFilename
})

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

let removeEmptyFiles = () => {
  let array = ['img', 'css', 'lib']
  array.forEach(emptyFiles => {
    storage
    .bucket(bucketName)
    .file(`/event/${projectName}/${emptyFiles}`)
    .delete()
    .then(() => {
      console.log(`gs://${bucketName}/${emptyFiles} deleted.`)
    })
    .catch(err => {
      console.error('ERROR:', err)
    })
  })
}

gulp.task('publish', () => {
  return gulp.src(['dist/**/*'])
    .pipe(gcPub({
      bucket: bucketName,
      keyFilename: keyFilename,
      projectId: projectId,
      base: `/event/${projectName}`,
      public: true,
      transformDestination: path => {
        return path
      },
      metadata: {
        cacheControl: 'max-age=315360000, no-transform, public'
      }
    }))
})

gulp.task('removeEmptyFiles', () => {
  removeEmptyFiles()
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
