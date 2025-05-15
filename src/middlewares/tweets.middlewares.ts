import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { checkSchema } from "express-validator"
import { isEmpty } from "lodash"
import { ObjectId } from "mongodb"
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from "~/constants/enums"
import HTTP_STATUS from "~/constants/httpStatus"
import { TWEETS_MESSAGES, USERS_MESSAGES } from "~/constants/messages"
import ErrorWithStatus from "~/models/Errors"
import Tweet from '~/models/schemas/Tweet.schema'
import DatabaseService from "~/services/database.services"
import { numberEnumToArray } from "~/utils/commons"
import { validate } from "~/utils/validation"

// For [1, 2, 3, 4, ...]
const tweetTypes = numberEnumToArray(TweetType)
const tweetAudiences = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEETS_MESSAGES.INVALID_TWEET_TYPE
        }
      },
      audience: {
        isIn: {
          options: [tweetAudiences],
          errorMessage: TWEETS_MESSAGES.INVALID_TWEET_AUDIENCE
        }
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            // Neu `type` la retweet/comment/quotetweet thi `parent_id`
            // phai la `tweet_id` cua tweet cha 
            if(
              [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) 
              && 
              !ObjectId.isValid(value)
            ) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
            }

            // Neu `type` la tweet thi `parent_id` phai la null
            if(type === TweetType.Tweet && value !== null) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
            }
            return true
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            const hashtags = req.body.hashtags as string[]
            const mentions = req.body.mentions as string[]
            // Neu `type` la comment/quotetweet/tweet va khong co `mention` va `hashtags`
            // thi `content` phai la string va khong duoc rong
            if(
              [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) 
              && 
              isEmpty(hashtags)
              &&
              isEmpty(mentions)
              &&
              value === ''
            ) {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
            }

            // Neu `type` la retweet thi `content` phai la `''`
            if(type === TweetType.Retweet && value !== '') {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_AN_EMPTY_STRING)
            }

            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Every elements must be string
            if(value.some((item: any) => typeof item !== 'string')) {
              throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
            }
            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Every elements must be ObjectId
            if(value.some((item: any) => !ObjectId.isValid(item))) {
              throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_A_VALID_ARRAY_OF_USER_ID)
            }
            return true
          }
        }
      },
      medias: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Every items in array is Media Object
            if(value.some((item: any) => {
              return typeof item.url !== 'string' || !mediaTypes.includes(item.type)                     
            })) {
              throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
            }
            return true
          }
        }
      }      
    }
  )
)

export const tweetIdValidator = validate(checkSchema({
  tweet_id: {
    custom: {
      options: async (value, { req }) => {
        if(!ObjectId.isValid(value)) {
          throw new ErrorWithStatus({
            status: HTTP_STATUS.BAD_REQUEST,
            message: TWEETS_MESSAGES.INVALID_TWEET_ID
          })
        }
        const tweet = await DatabaseService.tweets.aggregate<Tweet>(
          [
            {
              '$match': {
                '_id': new ObjectId(value)
              }
            }, {
              '$lookup': {
                'from': 'hashtags', 
                'localField': 'hashtags', 
                'foreignField': '_id', 
                'as': 'hashtags'
              }
            }, {
              '$lookup': {
                'from': 'users', 
                'localField': 'mentions', 
                'foreignField': '_id', 
                'as': 'mentions'
              }
            }, {
              '$addFields': {
                'mentions': {
                  '$map': {
                    'input': '$mentions', 
                    'as': 'mention', 
                    'in': {
                      '_id': '$$mention._id', 
                      'name': '$$mention.name', 
                      'username': '$$mention.username', 
                      'email': '$$mention.email'
                    }
                  }
                }
              }
            }, {
              '$lookup': {
                'from': 'bookmarks', 
                'localField': '_id', 
                'foreignField': 'tweet_id', 
                'as': 'bookmarks'
              }
            }, {
              '$lookup': {
                'from': 'likes', 
                'localField': '_id', 
                'foreignField': 'tweet_id', 
                'as': 'likes'
              }
            }, {
              '$lookup': {
                'from': 'tweets', 
                'localField': '_id', 
                'foreignField': 'parent_id', 
                'as': 'tweet_children'
              }
            }, {
              '$addFields': {
                'bookmarks': {
                  '$size': '$bookmarks'
                }, 
                'likes': {
                  '$size': '$likes'
                }, 
                'retweet_count': {
                  '$size': {
                    '$filter': {
                      'input': '$tweet_children', 
                      'as': 'item', 
                      'cond': {
                        '$eq': [
                          '$$item.type', TweetType.Retweet
                        ]
                      }
                    }
                  }
                }, 
                'comment_count': {
                  '$size': {
                    '$filter': {
                      'input': '$tweet_children', 
                      'as': 'item', 
                      'cond': {
                        '$eq': [
                          '$$item.type', TweetType.Comment
                        ]
                      }
                    }
                  }
                }, 
                'quote_count': {
                  '$size': {
                    '$filter': {
                      'input': '$tweet_children', 
                      'as': 'item', 
                      'cond': {
                        '$eq': [
                          '$$item.type', TweetType.QuoteTweet
                        ]
                      }
                    }
                  }
                }
                // 'views': {
                //   '$add': [
                //     '$user_views', '$guest_views'
                //   ]
                // }
              }
            }, {
              '$project': {
                'tweet_children': 0
              }
            }
          ]
        ).toArray() // For simplicity
        if(!tweet) {
          throw new ErrorWithStatus({
            status: HTTP_STATUS.NOT_FOUND,
            message: TWEETS_MESSAGES.TWEET_NOT_FOUND
          })
        }
        req.tweet = tweet
        return true
      }
    }
  }
}, ['params', 'body']))

// Async await in handler express must have try catch
// If not, use a wrapper function (wrapRequestHandler)
export const audienceValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tweet = req.tweet as Tweet
  if(tweet.audience === TweetAudience.TwitterCircle) {
    // Check if user logged in
    if(!req.decoded_authorization) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED
      })
    }

    // Check if author account is banned or deleted
    const author = await DatabaseService.user.findOne({
      _id: new ObjectId(tweet.user_id)
    })
    if(!author || author.verify == UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }

    // Check if viewer is in Twitter Circle
    const { user_id } = req.decoded_authorization
    const isInTwitterCircle = author.twitter_circle?.some(
      (user_circle_id) => user_circle_id.equals(user_id)
    )
    if(!isInTwitterCircle && !author._id.equals(user_id)) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC
      })
    }
  }
  next()
}

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEETS_MESSAGES.INVALID_TWEET_TYPE
        }
      },
      limit: {
        isNumeric: true,
        custom: {
          options: async ( value, { req } ) => {
            const num = Number(value)
            if(num > 100 || num < 1) {
              throw new Error(TWEETS_MESSAGES.MAXIMUM_TWEETS_PER_PAGE_IS_BETWEEN_1_AND_100)
            }
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: async ( values, { req } ) => {
            const num = Number(values)
            if(num < 1) {
              throw new Error(TWEETS_MESSAGES.NUMBER_OF_PAGE_MUST_BE_GREATER_THAN_0)
            }
          }
        }
      }
    },
    ['query']
  )
)