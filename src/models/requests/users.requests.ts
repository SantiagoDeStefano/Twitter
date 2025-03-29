import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'

export interface LoginRequestBody {
  email: string
  password: string
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

export interface FollowRequestBody {
  user_id: string
}

export interface GetProfileRequestParams {
  username: string
}

export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface VerifyEmailRequestBody {
  email_verify_token: string
}

export interface VerifyForgotPasswordRequestBody {
  forgot_password_token: string
}

export interface ResetPasswordRequestBody {
  forgot_password_token: string
  new_password: string
  confirm_new_password: string
}

export interface ForgotPasswordRequestBody {
  email: string
}

export interface LogoutRequestBody {
  refresh_token: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}
