export const USERS_MESSAGES = {
  ACCESS_TOKEN_REQUIRED: 'Access token is required',
  ALREADY_FOLLOWED: 'Already followed',
  ALREADY_UNFOLLOWED: 'Already unfollowed',

  BIO_MUST_BE_A_STRING: 'Bio must be a string',
  BIO_LENGTH_MUST_BE_BETWEEN_1_AND_100: 'Bio must be between 1 and 100',

  CHECK_YOUR_EMAIL_FOR_RESET_PASSWORD: 'Check your email for reset password',
  CONFIRM_PASSWORD_DOES_NOT_MATCH_PASSWORD: 'Password confirmation does not match password',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Password confirmation is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Password confirmation must be a string',
  CONFIRM_PASSWORD_MUST_BE_FROM_8_TO_16: 'Password confirmation must be between 8 and 16',
  CHANGE_PASSWORD_SUCCESS:'Change password successfully',

  DATE_OF_BIRTH_IS_REQUIRED: 'Date of birth is required',

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
  FOLLOW_SUCCESS: 'Follow success',
  
  GET_ME_SUCCESS: 'Get my profile success',
  GET_PROFILE_SUCCESS: 'Get profile success',
  GMAIL_NOT_VERIFIED: 'Email is not verified',
  
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  IMAGE_URL_MUST_BE_A_STRING: 'Image URL must be a string',
  IMAGE_URL_MUST_BE_BETWEEN_1_AND_400: 'Image URL must be between 1 and 400',
  INVALID_USER_ID: 'Invalid user ID',
  INVALID_USERNAME: 'Username must be between 4-15 characters and contain only letters, numbers, underscore',

  LOGIN_SUCCESS: 'Login success',
  LOGOUT_SUCCESS: 'Logout success',
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
  REGISTER_SUCCESS: 'Register success',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email success',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  REFRESH_TOKEN_SUCCESS: 'New tokens returned successfully',

  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or does not exist',
  USER_NOT_FOUND: 'User not found',
  USER_NOT_VERIFIED: 'User not verified',
  USERNAME_MUST_BE_A_STRING: 'Username must be a string',
  USERNAME_MUST_BE_BETWEEN_1_AND_50: 'Username must be between 1 and 50',
  UPDATE_ME_SUCCESS: 'Update me success',
  UNFOLLOW_SUCCESS: 'Unfollowed success',
  USERNAME_ALREADY_EXISTS: 'Username already exists',

  VALIDATION_ERROR: 'Validation error',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password success',

  WEBSITE_MUST_BE_A_STRING: 'Website must be a string',
  WEBSITE_LENGTH_MUST_BE_BETWEEN_1_AND_200: 'Website must be between 1 and 200',

  STRONG_PASSWORD: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
} as const

export const MEDIAS_MESSAGES = {
  IMAGE_UPLOAD_SUCCESS: 'Image uploaded successfully',
  VIDEO_UPLOAD_SUCCESS: 'Video uploaded successfully',
  GET_VIDEO_STATUS_SUCCESS: 'Get video status successfully'
} as const

export const TWEETS_MESSAGES = {
  CONTENT_MUST_BE_A_NON_EMPTY_STRING: 'Content must be a non-empty string',
  CONTENT_MUST_BE_AN_EMPTY_STRING: 'Content must be an empty string',
  CREATED_TWEET_BODY: 'Created tweet body',

  HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING: 'Hashtags must be an array of string',

  INVALID_TWEET_TYPE: 'Invalid tweet type',
  INVALID_TWEET_AUDIENCE: 'Invalid tweet audience',

  MENTIONS_MUST_BE_A_VALID_ARRAY_OF_USER_ID: 'Mentions must be a valid array of userId',
  MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT: 'Medias must be a valid array of media objects',

  PARENT_ID_MUST_BE_A_VALID_TWEET_ID: 'ParentID must be a valid tweet id',
  PARENT_ID_MUST_BE_NULL: 'ParentID must be null',
} as const 

export const BOOKMARKS_MESSAGES = {
  BOOKMARKS_TWEET_SUCCESSFULLY: 'Bookmarked tweet successfully'
} as const

export const LIKES_MESSAGES = {
  LIKES_TWEET_SUCCESSFULLY: 'Liked tweet successfully'
} as const