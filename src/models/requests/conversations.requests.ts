import { Query } from 'express-serve-static-core';

// Params
export interface ConversationRequestParams extends Query {
  receiver_id: string
  limit: string,
  page: string
}