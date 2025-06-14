import { S3Client, S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

config()

const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})

//D:\1_Website\Backend\Twitter\uploads\images\5d5ba74e2e47d492678728900.jpg
const file = fs.readFileSync(path.resolve('uploads/images/5d5ba74e2e47d492678728900.jpg'))

export const uploadFileToS3 = ({
  filename,
  filePath,
  contentType
}: {
  filename: string
  filePath: string
  contentType: string
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: { Bucket: 'twitter-backend-ap-southeast-1', Key: filename, Body: fs.readFileSync(filePath), ContentType: contentType },
  
    // optional tags
    tags: [
      /*...*/
    ],
  
    // additional optional fields show default values below:
  
    // (optional) concurrency configuration
    queueSize: 4,
  
    // (optional) size of each part, in bytes, at least 5MB
    partSize: 1024 * 1024 * 5,
  
    // (optional) when true, do not automatically call AbortMultipartUpload when
    // a multipart upload fails to complete. You should then manually handle
    // the leftover parts.
    leavePartsOnError: false
  })
  return parallelUploads3.done()
}

// parallelUploads3.on('httpUploadProgress', (progress) => {
//   console.log(progress)
// })

// parallelUploads3.done().then((res) => {
//   console.log(res)
// })

// try {
// } catch (e) {
//   console.log(e)
// }
