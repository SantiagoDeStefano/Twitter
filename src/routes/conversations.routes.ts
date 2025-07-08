import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversations.controllers'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, getConversationsValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

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
  paginationValidator,
  getConversationsValidator,
  wrapRequestHandler(getConversationsController)
)

export default conversationsRouter