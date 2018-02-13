const Storage = require('@google-cloud/storage')
const fs = require('fs')
const path = require('path')
const gcpKeyFile = `./service-account-file.json`
const bucketName = `ehanlin-event-test`
const projectId = `187045169515`
const projectName = `resolve`

const storage = new Storage({
  projectId: projectId,
  keyFilename: gcpKeyFile
})

let sourceDir = path.join(__dirname, './dist')

let findDist = dir => {
  fs.readdir(dir, (err, files) => {
    if (determineFileIsEmpty(files)) return
    if (err) throw err

    files.forEach(fileName => {
      let dirFilePath = path.join(dir, fileName)
      let folder = dirFilePath.split('/dist')[1]

      if (isMacDSstore(fileName)) return
      if (fs.statSync(dirFilePath).isDirectory()) {
        findDist(dirFilePath)
      } else {
        uploadGCP(dirFilePath, folder)
      }
    })
  })
}

let determineFileIsEmpty = files => {
  if (!files || files.length === 0) {
    console.log(`${files} is Empty`)
    return true
  }
  return false
}

let isMacDSstore = fileName => {
  if (fileName === '.DS_Store') {
    return true
  }
  return false
}

let uploadGCP = (dirFilePath, filePath) => {
  storage
    .bucket(bucketName)
    .upload(dirFilePath, {
      destination: `/event/${projectName}${filePath}`
    })
    .then(() => {
      console.log(`Bucket ${dirFilePath} created.`)
      makePublic(dirFilePath, filePath)
    })
    .catch(err => {
      console.error('ERROR:', err)
    })
}

// 公開權限
let makePublic = (dirFilePath, filePath) => {
  storage
    .bucket(bucketName)
    .file(`/event/${projectName}${filePath}`)
    .makePublic()
    .then(() => {
      console.log(`gs://${bucketName}/${dirFilePath} is now public.`)
    })
    .catch(err => {
      console.error('ERROR:', err)
    })
}
findDist(sourceDir)
