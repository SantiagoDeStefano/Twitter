import { Router } from 'express'
import { wrap } from 'lodash'
import { uploadImageController, uploadVideoController, uploadVideoHLSController, videoStatusController } from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
const mediasRouter = Router()

mediasRouter.post(
  '/upload-image', 
  accessTokenValidator, 
  verifiedUserValidator, 
  wrapRequestHandler(uploadImageController)
)

mediasRouter.post(
  '/upload-video', 
  accessTokenValidator, 
  verifiedUserValidator, 
  wrapRequestHandler(uploadVideoController)
)

mediasRouter.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoHLSController)
)

mediasRouter.get(
  '/video-status/:id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(videoStatusController)
)

export default mediasRouter