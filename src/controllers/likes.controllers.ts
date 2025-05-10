import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LIKES_MESSAGES } from '~/constants/messages'
import { LikeTweetRequestBody } from '~/models/requests/likes.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import likesService from '~/services/likes.services'


export const likeTweetController = async (
  req: Request<ParamsDictionary, any, LikeTweetRequestBody>,
  res: Response
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await likesService.likeTweet(user_id, req.body.tweet_id)
  res.json({
    message: LIKES_MESSAGES.LIKES_TWEET_SUCCESSFULLY,
    result
  })
}