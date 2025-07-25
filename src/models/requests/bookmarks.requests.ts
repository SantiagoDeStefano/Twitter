import { ParamsDictionary } from "express-serve-static-core"

// Request
export interface BookmarkTweetRequestBody {
  tweet_id: string
}


// Params
export interface UnbookmarkTweetParams extends ParamsDictionary {
  tweet_id: string
}