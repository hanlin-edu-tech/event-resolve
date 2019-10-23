const Q = require("q");
const del = require("del");
const gulp = require("gulp");
const cache = require("gulp-cache");
const imageMin = require("gulp-imagemin");
const util = require("gulp-template-util");
const pngquant = require("imagemin-pngquant");
const templateUtil = require("gulp-template-util");
const gcPub = require("gulp-gcloud-publish");

const bucketNameForTest = "tutor-test-events";
const bucketNameForProd = "tutor-events";
const projectId = "tutor-204108";
const projectIdTest = "tutor-test-238709";
const keyFileName = "tutor.json";
const keyFileNameTest = "tutor-test.json";
const projectName = "event/resolve/";

let uploadGCSProd = bucketName => {
    return gulp
        .src(["dist/*.html", "dist/img/**", "dist/css/**"], {
            base: `${__dirname}/dist/`
        })
        .pipe(
            gcPub({
                bucket: bucketName,
                keyFilename: keyFileName,
                base: projectName,
                projectId: projectId,
                public: true,
                metadata: {
                    cacheControl: "no-store, no-transform"
                }
            })
        );
};

let uploadGCSTest = bucketName => {
    return gulp
        .src(["dist/*.html", "dist/img/**", "dist/css/**"], {
            base: `${__dirname}/dist/`
        })
        .pipe(
            gcPub({
                bucket: bucketName,
                keyFilename: keyFileNameTest,
                base: projectName,
                projectId: projectIdTest,
                public: true,
                metadata: {
                    cacheControl: "no-store, no-transform"
                }
            })
        );
};

let copyStaticTask = dest => {
    return () => {
        return gulp
            .src(["src/**/*.html", "src/img/**/*", "src/css/**/*.css", "src/lib/**/*"], {
                base: "src"
            })
            .pipe(gulp.dest(dest));
    };
};

let cleanTask = () => {
    return del(["dist", ""]);
};

let minifyImage = sourceImage => {
    return gulp
        .src(sourceImage, {
            base: "./src"
        })
        .pipe(
            cache(
                imageMin({
                    use: [
                        pngquant({
                            speed: 7
                        })
                    ]
                })
            )
        )
        .pipe(gulp.dest("./dist"));
};

gulp.task("package", () => {
    let deferred = Q.defer();
    Q.fcall(() => {
        return util.logPromise(cleanTask);
    })
        .then(() => {
            return Q.all([templateUtil.logStream(minifyImage.bind(minifyImage, "./src/img/**/*.png"))]);
        })
        .then(() => {
            return Q.all([util.logStream(copyStaticTask("dist"))]);
        });
    return deferred.promise;
});

gulp.task("uploadGcsTest", uploadGCSTest.bind(uploadGCSTest, bucketNameForTest));
gulp.task("uploadGcsProd", uploadGCSProd.bind(uploadGCSProd, bucketNameForProd));
