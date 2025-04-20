import { NextFunction, Request, Response } from 'express'
import mediasService from '~/services/medias.services'
import { handleUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const result = await mediasService.handleUploadSingleImage(req)
  res.json({
    result: result
  })
}
