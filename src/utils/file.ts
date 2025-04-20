import { Request } from 'express'
import { UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
import formidable, { File } from 'formidable'

// Handling path
import fs from 'fs'

export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true
      })
    }
  })
}

export const handleUploadImage = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4, // Max 4 files a time
    keepExtensions: true,
    maxFileSize: 300 * 1024, //300KB
    maxTotalFileSize: 4 * 300 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.image || files.image.length === 0) {
        return reject(new Error('File can not be empty'))
      }
      resolve(files.image as File[])
    })
  })
}

export const handleUploadVideo = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1, // Max 1 video a time
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, //50MB
    filter: function ({ name, originalFilename, mimetype }) {
      // const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      // if(!valid) {
      //   form.emit('error' as any, new Error('File type is not valid') as any)
      // }
      // return valid
      return true
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.video || files.video.length === 0) {
        return reject(new Error('File can not be empty'))
      }
      resolve(files.video as File[])
    })
  })
}

export const getNameFromFullname = (fullname: string) => {
  const name = fullname.split('.')
  name.pop()
  return name.join('')
}
