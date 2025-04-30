import { Request } from 'express'
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { isProduction } from '~/constants/config'
import { EncodingStatus, MediaType } from '~/constants/enums'
import { Media } from '~/models/Others'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'

import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs'
import { config } from 'dotenv'
import DatabaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schema'

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
    
    const idName = getNameFromFullname(videoPath.split('/').pop() as string)
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
      await encodeHLSWithMultipleVideoStreams(videoPath)
      this.items.shift()
      fsPromise.unlinkSync(videoPath)
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
      await DatabaseService.videoStatus.updateOne(
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
      ).catch((err) => {
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
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        console.log(newPath)
        sharp.cache(false)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)

        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    // console.log(files)
    const result: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })
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
            ? `${process.env.HOST}/static/video-hls/${newName}/master.m3u8`
            : `http://localhost:${process.env.PORT}/static/video-hls/${newName}/master.m3u8`,
          type: MediaType.HLS
        }
      })
    )
    return result
  }

  async getVideoStatus(id: string) {
    const data = await DatabaseService.videoStatus.findOne({
      name: id
    })
    return data
  }
}

const mediasService = new MediasService()

export default mediasService
