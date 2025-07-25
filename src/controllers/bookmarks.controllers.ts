import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BOOKMARKS_MESSAGES } from '~/constants/messages'
import { BookmarkTweetRequestBody, UnbookmarkTweetParams } from '~/models/requests/bookmarks.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import bookmarksService from '~/services/bookmark.services'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>,
  res: Response
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarksService.bookmarkTweet(user_id, req.body.tweet_id)
  res.json({
    message: BOOKMARKS_MESSAGES.BOOKMARKS_TWEET_SUCCESSFULLY,
    result
  })
}

// Delete method can't send request body
export const unbookmarkTweetController = async (
  req: Request<UnbookmarkTweetParams>,
  res: Response
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  await bookmarksService.unbookmarkTweet(user_id, tweet_id)
  res.json({
    message: BOOKMARKS_MESSAGES.UNBOOKMARKS_TWEET_SUCCESSFULLY,
  })
}