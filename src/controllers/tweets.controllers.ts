import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { CreateTweetRequestBody, GetTweetRequestParams } from '~/models/requests/tweets.requests'
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
  req: Request<ParamsDictionary, any, GetTweetRequestParams>,
  res: Response
): Promise<void> => {
  const { tweet_id: get_tweet_id } = req.params
  const result = await tweetsService.getTweet(get_tweet_id)
  res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
    result
  })
}
