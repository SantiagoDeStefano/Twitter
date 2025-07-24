export const USERS_MESSAGES = {
  ACCESS_TOKEN_REQUIRED: 'Access token is required',
  ALREADY_FOLLOWED: 'Already followed',
  ALREADY_UNFOLLOWED: 'Already unfollowed or not following',

  BIO_MUST_BE_A_STRING: 'Bio must be a string',
  BIO_LENGTH_MUST_BE_BETWEEN_1_AND_100: 'Bio must be between 1 and 100',

  CHECK_YOUR_EMAIL_FOR_RESET_PASSWORD: 'Check your email for reset password',
  CONFIRM_PASSWORD_DOES_NOT_MATCH_PASSWORD: 'Password confirmation does not match password',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Password confirmation is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Password confirmation must be a string',
  CONFIRM_PASSWORD_MUST_BE_FROM_8_TO_16: 'Password confirmation must be between 8 and 16',
  CHANGE_PASSWORD_SUCCESS: 'Change password successfully',

  DATE_OF_BIRTH_IS_REQUIRED: 'Date of birth is required',
  DATE_OF_BIRTH_IS_NOT_VALID: 'Date of birth is not valid',

  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  EMAIL_AND_PASSWORD_REQUIRED: 'Email and password are required',
  EMAIL_DOES_NOT_EXIST: 'Email does not exist',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_VERIFY_SUCCESS: 'Email verified successfully',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',

  FORGOT_PASSWORD_TOKEN_REQUIRED: 'Forgot password token is required',
  FOLLOW_SUCCESS: 'Follow successfully',

  GET_ME_SUCCESS: 'Get my profile successfully',
  GET_PROFILE_SUCCESS: 'Get profile successfully',
  GMAIL_NOT_VERIFIED: 'Email is not verified',

  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  IMAGE_URL_MUST_BE_A_STRING: 'Image URL must be a string',
  IMAGE_URL_MUST_BE_BETWEEN_1_AND_400: 'Image URL must be between 1 and 400',
  INVALID_USER_ID: 'Invalid user ID',
  INVALID_USERNAME: 'Username must be between 4-15 characters and contain only letters, numbers, underscore',

  LOGIN_SUCCESS: 'Login successfully',
  LOGOUT_SUCCESS: 'Logout successfully',
  LOCATION_MUST_BE_A_STRING: 'Location must be a string',
  LOCATION_LENGTH_MUST_BE_BETWEEN_1_AND_100: 'Location length must be between 1 and 100',

  NAME_IS_REQUIRED: 'Name is required',
  NAME_LENGTH_MUST_BE_FROM_3_TO_100: 'Name length must be from 3 to 100',
  NAME_MUST_BE_A_STRING: 'Name must be a string',

  OLD_PASSWORD_DOES_NOT_MATCH: 'Old password does not match',

  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_MUST_BE_FROM_8_TO_16: 'Password must be between 8 and 16',
  PASSWORD_MUST_BE_STRONG: 'Password must be strong',

  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  REGISTER_SUCCESS: 'Register successfully',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email successfully',
  RESET_PASSWORD_SUCCESS: 'Reset password successfully',
  REFRESH_TOKEN_SUCCESS: 'New tokens returned successfully',

  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or does not exist',
  USER_NOT_FOUND: 'User not found',
  USER_NOT_VERIFIED: 'User not verified',
  USERNAME_MUST_BE_A_STRING: 'Username must be a string',
  USERNAME_MUST_BE_BETWEEN_1_AND_50: 'Username must be between 1 and 50',
  UPDATE_ME_SUCCESS: 'Update me successfully',
  UNFOLLOW_SUCCESS: 'Unfollowed successfully',
  USERNAME_ALREADY_EXISTS: 'Username already exists',

  VALIDATION_ERROR: 'Validation error',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password successfully',

  WEBSITE_MUST_BE_A_STRING: 'Website must be a string',
  WEBSITE_LENGTH_MUST_BE_BETWEEN_1_AND_200: 'Website must be between 1 and 200',

  STRONG_PASSWORD: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character'
} as const

export const MEDIAS_MESSAGES = {
  IMAGE_IS_REQUIRED :'Image is required',
  IMAGE_UPLOAD_SUCCESS: 'Image uploaded successfully',
  INVALID_VIDEO_ID: 'Invalid video ID',

  VIDEO_IS_REQUIRED: 'Video is required',
  VIDEO_UPLOAD_SUCCESS: 'Video uploaded successfully',
  VIDEO_ID_NOT_FOUND: 'Video ID not found',
  
  GET_VIDEO_STATUS_SUCCESS: 'Get video status successfully'
} as const

export const TWEETS_MESSAGES = {
  CONTENT_MUST_BE_A_NON_EMPTY_STRING: 'Content must be a non-empty string',
  CONTENT_MUST_BE_AN_EMPTY_STRING: 'Content must be an empty string',
  CREATED_TWEET_BODY: 'Created tweet body',

  GET_TWEET_SUCCESSFULLY: 'Get tweet successfully',
  GET_TWEET_CHILDREN_SUCCESSFULLY: 'Get tweet children successfully',
  GET_NEWFEEDS_SUCCESSFULLY: 'Get newfeeds successfully',

  HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING: 'Hashtags must be an array of string',

  INVALID_TWEET_TYPE: 'Invalid tweet type',
  INVALID_TWEET_AUDIENCE: 'Invalid tweet audience',
  INVALID_TWEET_ID: 'Invalid tweetID',

  MENTIONS_MUST_BE_A_VALID_ARRAY_OF_USER_ID: 'Mentions must be a valid array of userId',
  MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT: 'Medias must be a valid array of media objects',
  MAXIMUM_TWEETS_PER_PAGE_IS_BETWEEN_1_AND_100: 'Maximum tweets per page is between 1 and 100',
  NUMBER_OF_PAGE_MUST_BE_GREATER_THAN_0: 'Number of page must be greater than 0',
  
  PARENT_ID_MUST_BE_A_VALID_TWEET_ID: 'ParentID must be a valid tweet id',
  PARENT_ID_MUST_BE_NULL: 'ParentID must be null',

  TWEET_NOT_FOUND: 'Tweet notfound',
  TWEET_IS_NOT_PUBLIC: 'Tweet is not public'
} as const

export const BOOKMARKS_MESSAGES = {
  BOOKMARKS_TWEET_SUCCESSFULLY: 'Bookmarked tweet successfully',

  UNBOOKMARKS_TWEET_SUCCESSFULLY: 'Unbookmarked tweet successfully'
} as const

export const LIKES_MESSAGES = {
  LIKES_TWEET_SUCCESSFULLY: 'Liked tweet successfully',

  UNLIKES_TWEET_SUCCESSFULLY: 'Unliked tweet successfully'
} as const

export const SEARCH_MESSAGES = {
  PEOPLE_FOLLOW_MUST_BE_TRUE_OR_FALSE: 'Option to show tweet of followed people must be true or false',

  SEARCHED_SUCCESSFULLY: 'Searched successfully',
  SEARCH_CONTENT_MUST_BE_STRING: 'Search content must be a string'
} as const

export const CONVERSATIONS_MESSAGES = {
  GET_CONVERSATIONS_SUCCESSFULLY: 'Get conversations successfully'
} as const