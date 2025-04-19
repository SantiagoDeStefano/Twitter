import { NextFunction, Request, Response } from 'express'
import { handleUploadSingleImage } from '~/utils/file'


export const uploadSingleImageController = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const data = await handleUploadSingleImage(req)
  res.json({
    result: data
  })
}
