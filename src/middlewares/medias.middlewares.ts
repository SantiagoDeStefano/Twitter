import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { MEDIAS_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

import HTTP_STATUS from '~/constants/httpStatus'
import ErrorWithStatus from '~/models/Errors'
import DatabaseService from '~/services/database.services'

export const videoIdValidator = validate(checkSchema({
  id: {
    custom: {
      options: async (values, { req }) => {
        if (!ObjectId.isValid(values)) {
          throw new ErrorWithStatus({
            message: MEDIAS_MESSAGES.INVALID_VIDEO_ID,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        const video = await DatabaseService.videoStatus.findOne({
          _id: new ObjectId(values),
        })
        if (!video) {
          throw new ErrorWithStatus({
            message: MEDIAS_MESSAGES.VIDEO_ID_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
      }
    }
  }
}, ['params']))
