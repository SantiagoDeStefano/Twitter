import { CreateTweetRequestBody } from '~/models/requests/tweets.requests'
import DatabaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { TweetType } from '~/constants/enums'

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

  // async getTweet(tweet_id: string) {
  //   const result = await DatabaseService.tweets.findOne({
  //     _id: new ObjectId(tweet_id)
  //   })
  //   return result
  // }

  async increaseView(tweet_id: string, user_id?: string) {
    const increase = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await DatabaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: increase,
        $currentDate: {
          // Counted as MongoDB run
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1,
          updated_at: 1
        }
      }
    )
    return result as WithId<Tweet>
  }

  async getTweetChildren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  }: {
    tweet_id: string
    tweet_type: TweetType
    limit: number
    page: number
    user_id?: string
  }) {
    const tweets = await DatabaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  username: '$$mention.username',
                  email: '$$mention.email'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_children'
          }
        },
        {
          $addFields: {
            bookmarks: {
              $size: '$bookmarks'
            },
            likes: {
              $size: '$likes'
            },
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Retweet]
                  }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Comment]
                  }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.QuoteTweet]
                  }
                }
              }
            }
            // views: {
            //   $add: ['$user_views', '$guest_views']
            // }
          }
        },
        {
          $project: {
            tweet_children: 0
          }
        },
        {
          $skip: limit * (page - 1) // Pagination formular
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    const increase = user_id ? { user_views: 1 } : { guest_views: 1 }
    // updateMany didn't return the document
    // new Date() counted as server run
    const date = new Date()

    const [, totalPages] = await Promise.all([
      DatabaseService.tweets.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: increase,
          $set: {
            updated_at: date
          }
        }
      ),
      DatabaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])

    // updateMany didn't return the document back to the user
    // While we must return it.
    // So we needed to do these
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (user_id) {
        ;(tweet.user_views as number) = (tweet.user_views as number) + 1
      } else {
        ;(tweet.guest_views as number) = (tweet.guest_views as number) + 1
      }
    })

    return {
      tweets,
      totalPages
    }
  }
}

const tweetsService = new TweetsService()
export default tweetsService
