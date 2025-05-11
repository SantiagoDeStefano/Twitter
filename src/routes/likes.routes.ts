import { Router } from "express"
import { likeTweetController, unlikeTweetController } from "~/controllers/likes.controllers"
import { tweetIdValidator } from "~/middlewares/tweets.middlewares"
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const likesRoutes = Router()

/**
 * Description: Like tweet
 * Path: '/'
 * Method: POST
 * Body: { tweet_id: string }
 * Header: { Authorization: Bearer <access_token> }
 */
likesRoutes.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(likeTweetController)
)

/**
 * Description: Like tweet
 * Path: '/tweets/:tweet_unlike_id'
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */
likesRoutes.delete(
  '/tweets/:tweet_unlike_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unlikeTweetController)
)

export default likesRoutes