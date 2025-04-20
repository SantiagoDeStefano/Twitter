import { IncomingMessage } from 'http'
import { Request } from 'express'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'
import formidable, { File } from 'formidable'

// Handling path
import fs from 'fs'

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true // Create nested folder
    })
  }
}

export const handleUploadSingleImage = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024, //300KB
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if(!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })

  return new Promise<File>((resolve, reject) => {
    form.parse(req as IncomingMessage, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.image || files.image.length === 0) {
        return reject(new Error('File can not be empty'))
      }
      resolve(files.image[0])
    })
  })
}

export const getNameFromFullname = (fullname: string) => {
  const name = fullname.split('.')
  name.pop()
  return name.join('')
}