import { ObjectId, WithId } from "mongodb"
import DatabaseService from "./database.services"
import Like from "~/models/schemas/Like.schema"

class LikesService {
  async likeTweet(user_id: string, tweet_id: string) {
    const result = await DatabaseService.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Like
        ({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return (result as WithId<Like>)._id
  }
}

const likesService = new LikesService()
export default likesService