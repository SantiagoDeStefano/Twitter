import { Router } from "express"
import { createTweetController, getTweetController } from "~/controllers/tweets.controllers"
import { createTweetValidator, tweetIdValidator } from "~/middlewares/tweets.middlewares"
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares"
import { wrapRequestHandler } from "~/utils/handlers"

const tweetsRouter = Router()

/**
 * Description: Create tweet
 * Path: / 
 * Method: POST
 * Body: TweetRequestBody
 */
tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

/**
 * Description: Get tweet details
 * Path: /:tweet_id
 * Method: GET
 * Body: TweetRequestBody
 */
tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  wrapRequestHandler(getTweetController)
)

export default tweetsRouter