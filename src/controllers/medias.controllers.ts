import { NextFunction, Request, Response } from 'express'
import { MEDIAS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'

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
  console.log(name)
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

export const serveVideoController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  console.log(name)
  res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

