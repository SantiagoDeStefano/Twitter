import { checkSchema } from "express-validator";
import { MediaType, MediaTypeQuery } from "~/constants/enums";
import { SEARCH_MESSAGES } from "~/constants/messages";
import { validate } from "~/utils/validation";

export const searchValidator = validate(
  checkSchema({
    content: {
      isString: {
        errorMessage: SEARCH_MESSAGES.SEARCH_CONTENT_MUST_BE_STRING
      }
    },
    media_type: {
      optional: true,
      isIn: {
        options: [Object.values(MediaTypeQuery)]
      },
      errorMessage: `Media type must be one of ${Object.values(MediaTypeQuery).join(', ')}`
    },
    people_follow: {
      optional: true,
      isIn: {
        options: [['true', 'false']],
        errorMessage: SEARCH_MESSAGES.PEOPLE_FOLLOW_MUST_BE_TRUE_OR_FALSE
      }
    }
  }, ["query"])
)