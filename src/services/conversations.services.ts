import { ObjectId } from "mongodb"
import DatabaseService from "./database.services"

class ConversationService {
  async getConversation({ sender_id, receiver_id }: { sender_id: string, receiver_id: string }) {
    const conversations = await DatabaseService.conversations.find({
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
    })
    .toArray()

    return conversations
  }
}

const conversationService = new ConversationService()
export default conversationService