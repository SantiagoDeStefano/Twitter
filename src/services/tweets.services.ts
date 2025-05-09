import { TweetRequestBody } from "~/models/requests/tweets.requests";
import DatabaseService from "./database.services";
import Tweet from "~/models/schemas/Tweet.schema";
import { ObjectId } from "mongodb";

class TweetsService {
  async createTweet(user_id: string, body: TweetRequestBody) {
    const result = await DatabaseService.tweets.insertOne(
      new Tweet({
      user_id: new ObjectId(user_id),
        type: body.type,
        audience: body.audience,
        content: body.content,
        parent_id: body.parent_id,
        hashtags: [],
        mentions: body.mentions,
        medias: body.medias
      })
    )
    const tweet = await DatabaseService.tweets.findOne({ _id: result.insertedId })
    return tweet
  }
}

const tweetsService = new TweetsService()
export default tweetsService