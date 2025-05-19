import { SearchQuery } from '~/models/requests/search.requests'
import DatabaseService from './database.services'
import { ObjectId } from 'mongodb'
import { MediaType, MediaTypeQuery, TweetAudience, TweetType } from '~/constants/enums'
import Tweet from '~/models/schemas/Tweet.schema'

class SearchService {
  // Override the pagination
  async search({
    limit,
    page,
    content,
    media_type,
    user_id,
    people_follow
  }: {
    limit: number
    page: number
    content: string
    media_type?: MediaTypeQuery
    user_id: string
    people_follow?: string
  }) {
    const match: any = {
      $text: {
        $search: content
      }
    }

    if (media_type) {
      if (media_type === MediaTypeQuery.Image) {
        match['medias.type'] = MediaType.Image
      } else if (media_type === MediaTypeQuery.Video) {
        match['medias.type'] = {
          $in: [MediaType.Video, MediaType.HLS]
        }
      }
    }

    if (people_follow === 'true') {
      const user_object_id = new ObjectId(user_id)
      const followed_user_ids = await DatabaseService.followers
        .find(
          {
            user_id: user_object_id
          },
          {
            projection: {
              followed_user_id: 1,
              _id: 0
            }
          }
        )
        .toArray()
      const ids = followed_user_ids.map((item) => item.followed_user_id)
      // Newfeeds would take user_id's tweet also
      ids.push(user_object_id)
      match['user_id'] = {
        $in: ids
      }
    }

    const user_object_id = new ObjectId(user_id)
    console.log(match)

    const [tweets, total] = await Promise.all([
      DatabaseService.tweets
        .aggregate([
          {
            $match: match
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: TweetAudience.Everyone
                },
                {
                  $and: [
                    {
                      audience: TweetAudience.TwitterCircle
                    },
                    {
                      'user.twitter_circle': {
                        $in: [user_object_id]
                      }
                    }
                  ]
                }
              ]
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
              },
              views: {
                $add: ['$user_views', '$guest_views']
              }
            }
          },
          {
            $project: {
              tweet_children: 0,
              user: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                twitter_circle: 0,
                date_of_birth: 0
              }
            }
          },
          // {
          //   $project: {
          //     user: {
          //       name: 1,
          //       email: 1
          //     }
          //   }
          // },
          {
            $skip: limit * (page - 1) // Pagination formular
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      DatabaseService.tweets
        .aggregate([
          {
            $match: match
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: TweetAudience.Everyone
                },
                {
                  $and: [
                    {
                      audience: TweetAudience.TwitterCircle
                    },
                    {
                      'user.twitter_circle': {
                        $in: [user_object_id]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])

    const tweet_ids = tweets.map((tweet) => tweet._id as ObjectId)
    // updateMany didn't return the document
    // new Date() counted as server run
    const date = new Date()

    DatabaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_ids
        }
      },
      {
        // Only get newfeeds after logged in
        $inc: { user_views: 1 },
        $set: {
          updated_at: date
        }
      }
    )

    // updateMany didn't return the document back to the user
    // While we must return it.
    // So we needed to do these
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      ;(tweet.user_views as number) = (tweet.user_views as number) + 1
    })

    return {
      tweets,
      total: total[0]?.total || 0
    }
  }
}

const searchService = new SearchService()

export default searchService
