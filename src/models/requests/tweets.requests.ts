import { ObjectId } from "mongodb";
import { TweetAudience, TweetType } from "~/constants/enums";
import { ParamsDictionary, Query } from 'express-serve-static-core';
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
export interface GetTweetRequestParams extends ParamsDictionary {
  tweet_id: string
}

export interface GetTweetChildrenRequestParams extends ParamsDictionary {
  tweet_id: string
}

// Query
export interface GetTweetChildrenRequestQuery extends Query {
  tweet_type: string
  limit: string
  page: string
}

export interface Pagination extends Query {
  limit: string,
  page: string
}