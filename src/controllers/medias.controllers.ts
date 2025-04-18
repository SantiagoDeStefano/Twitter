import { NextFunction, Request, Response } from 'express'
import path from 'path'
import formidable from 'formidable'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true,
    maxFieldsSize: 300 * 1024 //300KB
  })

  //Callback function
  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }
    res.json({
      message: 'Upload image successfully'
    })
  })
}
