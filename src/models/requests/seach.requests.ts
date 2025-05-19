import { Pagination } from "./tweets.requests";

export interface SearchQuery extends Pagination {
  content: string
}