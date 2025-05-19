import { MediaTypeQuery } from "~/constants/enums";
import { Pagination } from "./tweets.requests";
import { ParamsDictionary, Query } from 'express-serve-static-core';

// Query
export interface SearchQuery extends Pagination {
  content: string
  media_type: MediaTypeQuery
  people_follow: string
}