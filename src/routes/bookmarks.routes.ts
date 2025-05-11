import { Router } from "express"
import { bookmarkTweetController, unbookmarkTweetController } from "~/controllers/bookmarks.controllers"
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const bookmarksRouter = Router()

/**
 * Description: Bookmark Tweet
 * Path: /
 * Method: POST
 * Body: { tweet_id: string }
 * Header: { Authorization: Bearer <access_token> }
 */
bookmarksRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(bookmarkTweetController)
)

/**
 * Description: Bookmark Tweet
 * Path: /tweets/:tweet_unbookmark_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */
bookmarksRouter.delete(
  '/tweets/:tweet_unbookmark_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(unbookmarkTweetController)
)

export default bookmarksRouter