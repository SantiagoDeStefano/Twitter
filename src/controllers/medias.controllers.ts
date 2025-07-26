import { NextFunction, Request, Response } from 'express'
import { MEDIAS_MESSAGES } from '~/constants/messages'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'

import fs from 'fs'
import mediasService from '~/services/medias.services'
import path from 'path'
import HTTP_STATUS from '~/constants/httpStatus'
import mime from 'mime'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const url = await mediasService.uploadImage(req)
  res.json({
    message: MEDIAS_MESSAGES.IMAGE_UPLOAD_SUCCESS,
    result: url
  })
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const url = await mediasService.uploadVideo(req)
  res.json({
    message: MEDIAS_MESSAGES.VIDEO_UPLOAD_SUCCESS,
    result: url
  })
}

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

export const serveVideoStreamController = (req: Request, res: Response, next: NextFunction) => {
  const range = req.headers.range
  if (!range) {
    res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
  }
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  // 1MB = 10^6 bytes (Tinh theo he 10, day la thu ma chung ta thay tren UI)
  // Con neu tinh theo he nhi phan thi 1MB = 2^20 bytes (1024 * 1024)

  // Dung luong video
  const videoSize = fs.statSync(videoPath).size
  // Dung luong video cho moi phan doan stream
  const chunkSize = 10 ** 6 //1MB
  // Lay gia tri byte bat dau tu header range(vd: bytes = 1048567-)
  const start = Number(range?.replace(/\D/g, ''))
  // Lay gia tri byte ket thuc, vuot qua dung luong videoSize = videoSize
  const end = Math.min(start + chunkSize, videoSize - 1)

  // Dung luong thuc te cho moi doan video stream,
  // Thuong day se la chunkSize, ngoai tru doan cuoi cung
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'

  /**
   * Format của header Content-Range: bytes <start> - <end> / <videoSize>
   * Ví dụ: Content-Range: bytes 1048574-3145727/3145728
   * Yêu cầu là `end` phải luôn luôn nhỏ `videoSize`
   * ❌ `Content-Range`: `bytes 0-100/100`
   * ✅ `Content-Range`: `bytes 0-99/100`
   *
   * Còn Content-Length = end - start + 1. Đại diện cho khoảng cách.
   * Công thức là end - start + 1
   *
   * ChunkSize = 50
   * videoSize = 100
   * |0 -------------- 50|51 -------------- 99|100 (end)
   * stream 1: start = 0, end = 50, contentLength = 51
   * stream 2: start = 51, end = 99, contentLength = 49
   */

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}

export const serveM3U8Controller = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, 'master.m3u8'), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

export const serveSegmentController = (req: Request, res: Response, next: NextFunction) => {
  const { id, v, segment } = req.params
  // Segment: 0.ts, 1.ts, 2.ts, ...
  console.log("id: ", id)
  console.log("v: ", v)
  console.log("segment: ", segment)
  res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, v, segment), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

export const uploadVideoHLSController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const url = await mediasService.uploadVideoHLS(req)
  res.json({
    message: MEDIAS_MESSAGES.VIDEO_UPLOAD_SUCCESS,
    result: url
  })
}

export const videoStatusController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params
  const result = await mediasService.getVideoStatus(id as string)
  res.json({
    message: MEDIAS_MESSAGES.GET_VIDEO_STATUS_SUCCESS,
    video_status: result
  })
}