import { Request, Response } from 'express'
import { CONVERSATIONS_MESSAGES } from '~/constants/messages'
import { ConversationRequestParams } from '~/models/requests/conversations.requests'
import { ParamsDictionary } from 'express-serve-static-core'

import conversationService from '~/services/conversations.services'

export const getConversationsController = async(
  req: Request<ParamsDictionary, any, any, ConversationRequestParams>,
  res: Response
) => {
  const { receiver_id } = req.params
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const sender_id = req.decoded_authorization?.user_id as string
  console.log(limit, page, sender_id)
  const result = await conversationService.getConversation({ sender_id, receiver_id, limit, page })
  res.json({
    message: CONVERSATIONS_MESSAGES.GET_CONVERSATIONS_SUCCESSFULLY,
    result: {
      limit,
      page,
      total_page: Math.ceil(result.total/limit),
      conversations: result.conversations
    }
  })
  return
}