import { Request } from 'express'
import { getNameFromFullname, handleUploadSingleImage } from '~/utils/file'
import { UPLOAD_DIR } from '~/constants/dir'

import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullname(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
    console.log(newPath)
    sharp.cache(false)
    await sharp(file.filepath).jpeg().toFile(newPath)
    fs.unlinkSync(file.filepath)
    return `http://localhost:4000/uploads/${newName}.jpg`
  }
}

const mediasService = new MediasService()

export default mediasService
