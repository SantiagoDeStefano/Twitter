import { CreateTweetRequestBody } from '~/models/requests/tweets.requests'
import DatabaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'

class TweetsService {
  async checkAndCreateHashtags(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        // Find hashtag in database, if found then return, if not then create new
        return DatabaseService.hashtags.findOneAndUpdate(
          {
            name: hashtag
          },
          {
            $setOnInsert: new Hashtag({ name: hashtag })
          },
          {
            upsert: true,
            // Because first-time insertion would make the value null, add 
            // `returnDocument` to fix this problem
            returnDocument: 'after'
          }
        )
      })
    )
    return hashtagDocuments.map((hashtag) => (hashtag as WithId<Hashtag>)._id)
  }

  async createTweet(user_id: string, body: CreateTweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtags(body.hashtags)
    const result = await DatabaseService.tweets.insertOne(
      new Tweet({
        user_id: new ObjectId(user_id),
        type: body.type,
        audience: body.audience,
        content: body.content,
        parent_id: body.parent_id,
        hashtags: hashtags,
        mentions: body.mentions,
        medias: body.medias
      })
    )
    const tweet = await DatabaseService.tweets.findOne({ _id: result.insertedId })
    return tweet
  }

  async getTweet(tweet_id: string) {
    const result = await DatabaseService.tweets.findOne({
      _id: new ObjectId(tweet_id)
    })
    return result
  }
}

const tweetsService = new TweetsService()
export default tweetsService
