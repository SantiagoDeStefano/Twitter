import { Router } from "express"
import { likeTweetController } from "~/controllers/likes.controllers"
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
  wrapRequestHandler(likeTweetController)
)

export default likesRoutes