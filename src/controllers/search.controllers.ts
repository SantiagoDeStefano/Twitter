import { Request, Response, NextFunction, query } from 'express'
import { Params, ParamsDictionary } from 'express-serve-static-core'
import { SEARCH_MESSAGES } from '~/constants/messages'
import { SearchQuery } from '~/models/requests/search.requests'
import searchService from '~/services/search.services'

export const searchController = async (
  req: Request<ParamsDictionary, any, any, SearchQuery>,
  res: Response
): Promise<void> => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const content = req.query.content
  const media_type = req.query.media_type
  const user_id = req.decoded_authorization?.user_id as string
  const people_follow = req.query.people_follow

  const result = await searchService.search({
    limit,
    page,
    content: content,
    media_type: media_type,
    user_id: user_id,
    people_follow: people_follow
  })
  res.json({
    message: SEARCH_MESSAGES.SEARCHED_SUCCESSFULLY,
    result: {
      tweets: result.tweets,
      limit,
      page,
      total_pages: Math.ceil(result.total / limit)
    }
  })
  return
}
