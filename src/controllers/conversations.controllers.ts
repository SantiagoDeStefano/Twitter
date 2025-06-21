import { Request, Response } from 'express'
import { CONVERSATIONS_MESSAGES } from '~/constants/messages'
import conversationService from '~/services/conversations.services'

export const getConversationsController = async(
  req: Request,
  res: Response
) => {
  const { receiver_id } = req.params
  const sender_id = req.decoded_authorization?.user_id as string
  const result = await conversationService.getConversation({ sender_id, receiver_id })
  res.json({
    result,
    message: CONVERSATIONS_MESSAGES.GET_CONVERSATIONS_SUCCESSFULLY
  })
  return
}