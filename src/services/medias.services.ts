import { Request } from 'express'
import { getFiles, getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { envConfig, isProduction } from '~/constants/config'
import { EncodingStatus, MediaType } from '~/constants/enums'
import { Media } from '~/models/Others'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import { config } from 'dotenv'
import { uploadFileToS3 } from '~/utils/s3'
import { ObjectId } from 'mongodb'

import slash from 'slash'
import sharp from 'sharp'
import path from 'path'
import DatabaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import mime from 'mime'
import fsPromise from 'fs/promises'

config()

class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  async enqueue(item: string) {
    this.items.push(item)
    // item = /home/lamuyenphuong/Downloads/123123/123123.mp4
    const idName = getNameFromFullname(item.split('/').pop() as string)
    await DatabaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )
    this.processEncode()
  }
  async processEncode() {
    if (this.encoding) {
      return
    }
    if (this.items.length <= 0) {
      console.log('Queue is empty')
      return
    }

    this.encoding = true
    const videoPath = this.items[0]

    const idName = getNameFromFullname(videoPath.split('\\').pop() as string)

    await DatabaseService.videoStatus.updateOne(
      {
        name: idName
      },
      {
        $set: {
          status: EncodingStatus.Processing
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    try {
      this.items.shift()
      await encodeHLSWithMultipleVideoStreams(videoPath)
      const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR, idName))
      await Promise.all(
        files.map((filepath) => {
          const filename = slash('videos-hls' + filepath.replace(path.resolve(UPLOAD_VIDEO_DIR), ''))
          return uploadFileToS3({
            filename: filename,
            filePath: filepath,
            contentType: mime.getType(filepath) as string
          })
        })
      )

      await Promise.all([
        fsPromise.unlink(videoPath),
        fsPromise.rm(path.resolve(UPLOAD_VIDEO_DIR, idName), { recursive: true, force: true })
      ])

      await DatabaseService.videoStatus.updateOne(
        {
          name: idName
        },
        {
          $set: {
            status: EncodingStatus.Successfully
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
      console.log(`Encode video ${videoPath} success`)
    } catch (error) {
      await DatabaseService.videoStatus
        .updateOne(
          {
            name: idName
          },
          {
            $set: {
              status: EncodingStatus.Failed
            },
            $currentDate: {
              updated_at: true
            }
          }
        )
        .catch((err) => {
          console.error('Update video status error', err)
        })
      console.log(`Encode video ${videoPath} error`)
      console.log(error)
    }
    this.encoding = false
    this.processEncode()
  }
}

const queue = new Queue()

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newFullFilename = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newFullFilename}`)
        console.log(newPath)
        sharp.cache(false)
        await sharp(file.filepath).jpeg().toFile(newPath)

        const s3Result = await uploadFileToS3({
          filename: 'images/' + newFullFilename,
          filePath: newPath,
          contentType: mime.getType(newPath) as string
        })

        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])

        return {
          url: s3Result.Location as string,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFileToS3({
          filename: 'videos/' + file.newFilename,
          contentType: mime.getType(file.filepath) as string,
          filePath: file.filepath
        })

        fsPromise.unlink(file.filepath)

        return {
          url: s3Result.Location as string,
          type: MediaType.Video
        }
      })
    )
    return result
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        // await encodeHLSWithMultipleVideoStreams(file.filepath)
        queue.enqueue(file.filepath)
        // fsPromise.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${envConfig.host}/static/video-hls/${newName}/master.m3u8`
            : `http://localhost:${envConfig.port}/static/video-hls/${newName}/master.m3u8`,
          type: MediaType.HLS
        }
      })
    )
    return result
  }

  async getVideoStatus(id: string) {
    const data = await DatabaseService.videoStatus.findOne({
      _id: new ObjectId(id)
    })
    return data?.status
  }
}

const mediasService = new MediasService()

export default mediasService
