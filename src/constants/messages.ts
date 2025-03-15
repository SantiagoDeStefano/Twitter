export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',

  USER_NOT_FOUND: 'User not found',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or does not exist',

  NAME_IS_REQUIRED: 'Name is required',
  NAME_LENGTH_MUST_BE_FROM_3_TO_100: 'Name length must be from 3 to 100',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_DOES_NOT_EXIST: 'Email does not exist',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_AND_PASSWORD_REQUIRED: 'Email and password are required',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  EMAIL_VERIFY_SUCCESS: 'Email verified successfully',

  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_FROM_8_TO_16: 'Password must be between 8 and 16',
  PASSWORD_MUST_BE_STRONG: 'Password must be strong',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  
  CONFIRM_PASSWORD_IS_REQUIRED: 'Password confirmation is required',
  CONFIRM_PASSWORD_MUST_BE_FROM_8_TO_16: 'Password confirmation must be between 8 and 16',
  CONFIRM_PASSWORD_DOES_NOT_MATCH_PASSWORD: 'Password confirmation does not match password',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Password confirmation must be a string',
  CHECK_YOUR_EMAIL_FOR_RESET_PASSWORD: 'Check your email for reset password',

  DATE_OF_BIRTH_IS_REQUIRED: 'Date of birth is required',

  LOGIN_SUCCESS: 'Login success',
  LOGOUT_SUCCESS: 'Logout success',

  REGISTER_SUCCESS: 'Register success',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email success',

  ACCESS_TOKEN_REQUIRED: 'Access token is required'
} as const
