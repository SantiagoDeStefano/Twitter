import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'
import { ParamsDictionary } from 'express-serve-static-core'
import { IncomingMessage } from 'http'; // Add this import

//Requests
export interface FollowRequestBody {
  followed_user_id: string
}

export interface ForgotPasswordRequestBody {
  email: string
}

export interface LoginRequestBody {
  email: string
  password: string
}

export interface LogoutRequestBody {
  refresh_token: string
}

export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface ResetPasswordRequestBody {
  forgot_password_token: string
  new_password: string
  confirm_new_password: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}

export interface UpdateMeRequestBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface VerifyEmailRequestBody {
  email_verify_token: string
}

export interface VerifyForgotPasswordRequestBody {
  forgot_password_token: string
}

export interface ChangePasswordRequest extends ParamsDictionary {
  new_password: string,
  confirm_new_password: string
}

//Params
export interface GetProfileRequestParams extends ParamsDictionary {
  username: string
}

export interface UnfollowRequestParams extends ParamsDictionary {
  user_id: string
}