const Q = require('q')
const del = require('del')
const gulp = require('gulp')
const cache = require('gulp-cache')
const imageMin = require('gulp-imagemin')
const util = require('gulp-template-util')
const gcPub = require('gulp-gcloud-publish')
const pngquant = require('imagemin-pngquant')
const templateUtil = require('gulp-template-util')

let bucketNameForTest = 'tutor-events-test'
let bucketNameForProd = 'tutor-events'
let projectId = 'tutor-204108'
let keyFilename = 'tutor.json'
let projectName = 'event/resolve/'

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

let minifyImage = sourceImage => {
  return gulp
    .src(sourceImage, {
      base: './src'
    })
    .pipe(cache(imageMin({
      use: [pngquant({
        speed: 7
      })]
    })))
    .pipe(gulp.dest('./dist'))
}

let uploadGCS = bucketName => {
  return gulp
    .src([
      './dist/*.html',
      './dist/css/**/*.css',
      './dist/js/**/*.js',
      './dist/lib/**/*.@(js|json|css|html)',
      './dist/img/**/*.@(png|jpg|svg|gif)'
    ], {
      base: `${__dirname}/dist/`
    })
    .pipe(gcPub({
      bucket: bucketName,
      keyFilename: keyFilename,
      base: projectName,
      projectId: projectId,
      public: true,
      metadata: {
        cacheControl: 'private, no-transform'
      }
    }))
}

/* upload to gcp test */
gulp.task('uploadGcpTest', uploadGCS.bind(uploadGCS, bucketNameForTest))

/* upload to gcp test */
gulp.task('uploadGcpProd', uploadGCS.bind(uploadGCS, bucketNameForProd))

gulp.task('package', () => {
  let deferred = Q.defer()
  Q.fcall(() => {
    return util.logPromise(cleanTask)
  })
    .then(() => {
      return Q.all([
        templateUtil.logStream(minifyImage.bind(minifyImage, './src/img/**/*.png'))
      ])
    })
    .then(() => {
      return Q.all([
        util.logStream(copyStaticTask('dist'))
      ])
    })
  return deferred.promise
})
