import Bookmark from '~/models/schemas/Bookmark.schema'
import DatabaseService from './database.services'
import { ObjectId, WithId } from 'mongodb'

class BookmarksService {
  async bookmarkTweet(user_id: string, tweetId: string) {
    const result = await DatabaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweetId)
      },
      {
        $setOnInsert: new Bookmark
        ({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweetId)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    // return (result as WithId<Bookmark>)._id
    return result
  }

  async unbookmarkTweet(user_id: string, tweetId: string) {
    await DatabaseService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweetId)
    })
  }
}

const bookmarksService = new BookmarksService()
export default bookmarksService
