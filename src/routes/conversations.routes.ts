import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversations.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'

const conversationsRouter = Router()

/**
 * Description: Get conversation 
 * (we already have senderId through access_token, so we just need to send receiver_id)
 * Path: '/receivers/:receiver_id'
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
conversationsRouter.get(
  '/receiver/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  getConversationsController
)

export default conversationsRouter