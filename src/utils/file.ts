import { IncomingMessage } from 'http'
import { Request } from 'express'
import fs from 'fs'
import formidable from 'formidable'
// Handling path
import path from 'path'

export const initFolder = () => {
  const uploadFolderPath = path.resolve('uploads/images')
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, {
      recursive: true // Create nested folder
    })
  }
}

export const handleUploadSingleImage = (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if(!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })

  return new Promise((resolve, reject) => {
    form.parse(req as IncomingMessage, (err, fields, files) => {
      // console.log('fields', fields)
      // console.log('files', files)
      if (err) {
        return reject(err)
      }
      if(!Boolean(files.image)) {
        return reject(new Error('File can not be empty'))
      }
      resolve(files)
    })
  })
}
