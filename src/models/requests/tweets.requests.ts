import { ObjectId } from "mongodb";
import { TweetAudience, TweetType } from "~/constants/enums";
import { Media } from "../Others";

// Body
export interface CreateTweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId //  chỉ null khi tweet gốc
  hashtags: string[]
  mentions: string[]
  medias: Media[]
}

// Params
export interface GetTweetRequestParams {
  tweet_id: string
}