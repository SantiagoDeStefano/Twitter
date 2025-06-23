import { ObjectId } from 'mongodb'
import DatabaseService from './database.services'

class ConversationService {
  async getConversation({
    sender_id,
    receiver_id,
    limit,
    page
  }: {
    sender_id: string
    receiver_id: string
    limit: number
    page: number
  }) {
    const match = {
      $or: [
        {
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receiver_id)
        },
        {
          sender_id: new ObjectId(receiver_id),
          receiver_id: new ObjectId(sender_id)
        }
      ]
    }

    const [conversations, total] = await Promise.all([
      DatabaseService.conversations
      .find(match)
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray(),

      DatabaseService.conversations.countDocuments(match)
    ])

    return {
      conversations,
      total
    }
  }
}

const conversationService = new ConversationService()
export default conversationService