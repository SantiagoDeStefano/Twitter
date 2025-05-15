import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetType } from '~/constants/enums'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { CreateTweetRequestBody, GetTweetChildrenRequestQuery, GetTweetRequestParams } from '~/models/requests/tweets.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import tweetsService from '~/services/tweets.services'

export const createTweetController = async (
  req: Request<ParamsDictionary, any, CreateTweetRequestBody>,
  res: Response
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(user_id, req.body)
  res.json({
    message: TWEETS_MESSAGES.CREATED_TWEET_BODY,
    result
  })
}

export const getTweetController = async (
  req: Request<GetTweetRequestParams>,
  res: Response
): Promise<void> => {

  // Query database, we can either add queries in mongoDB or 

  // const { tweet_id: get_tweet_id } = req.params
  // const result = await tweetsService.getTweet(get_tweet_id)

  const { tweet_id: get_tweet_id } = req.params
  const  user_id = (req.decoded_authorization as TokenPayload)?.user_id

  const result = await tweetsService.increaseView(get_tweet_id, user_id)
  const tweet = {
    ...req.tweet,
    guest_views: result?.guest_views,
    user_views: result?.user_views,
    updated_at: result.updated_at
  }

  res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
    result: tweet
  })
}

export const getTweetChildrenController = async (
  req: Request<GetTweetRequestParams, any, GetTweetChildrenRequestQuery>,
  res: Response
): Promise<void> => {

    const tweet_id = req.params.tweet_id
    const tweet_type =Number(req.query.tweet_type as string) as TweetType
    const limit = Number(req.query.limit as string)
    const page = Number(req.query.page as string)
    const user_id = req.decoded_authorization?.user_id

  const { tweets, totalPages } = await tweetsService.getTweetChildren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  })
  res.json({
    message: TWEETS_MESSAGES.GET_TWEET_CHILDREN_SUCCESSFULLY,
    result: {
      tweets: tweets,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(totalPages/limit)
    }
  })
}

