import { RegisterRequestBody } from '~/models/requests/users.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { 
  TokenType, 
  UserVerifyStatus } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { config } from 'dotenv'

import User from '~/models/schemas/user.schema'
import DatabaseService from './database.services'
import RefreshToken from '~/models/schemas/RefreshToken.schema'

config()

class UserService {
  private signAccessToken(user_id: string): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as any
      }
    }) as Promise<string>
  }

  private signRefreshToken(user_id: string): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as any
      }
    }) as Promise<string>
  }

  private async signAccessAndRefreshToken(user_id: string): Promise<[string, string]> {
    const access_token = await this.signAccessToken(user_id)
    const refresh_token = await this.signRefreshToken(user_id)
    return [access_token, refresh_token]
  }

  private signEmailVerifyToken(user_id: string): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as any
      }
    }) as Promise<string>
  }

  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    await DatabaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async register(payload: RegisterRequestBody) {  
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    await DatabaseService.user.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString())
    await DatabaseService.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return {
      access_token,
      refresh_token,
      email_verify_token
    }
  }

  async logout(refresh_token: string) {
    await DatabaseService.refreshToken.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async checkEmailExist(email: string) {
    const user = await DatabaseService.user.findOne({ email })
    return Boolean(user)
  }

  async verifyEmail(user_id: string) {
    //Declare update value
    //MongoDB update the value 
    const [tokens] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),

      DatabaseService.user.updateOne(
        { _id: new ObjectId(user_id) },
        [{
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified,
            updated_at: '$$NOW'
          }
        }]
      )
    ])

    const [access_token, refresh_token] = tokens

    return {
      access_token,
      refresh_token
    }
  }

  async resendEmailVerifyToken(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    //Fake resend email
    console.log('Resend verify email: ', email_verify_token)
  
    //Update email_verify_token in database
    await DatabaseService.user.updateOne(
      { _id: new ObjectId(user_id) },
      [{
        $set: {
          email_verify_token,
          updated_at: '$$NOW'
        }
      }]
    )
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS,
    }
  }

  async signForgotPasswordToken(user_id: string): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as any
      }
    }) as Promise<string>
  }

  async forgotPassword(user_id: string) {
    const forgot_password_token = await this.signForgotPasswordToken(user_id)
    await DatabaseService.user.updateOne(
      { _id: new ObjectId(user_id) },
      [{
        $set: {
          forgot_password_token,  
          updated_at: '$$NOW'
        }
      }]
    )
    //Fake sending email https://twitter.com/forgot-password?token=token
    console.log('Forgot password token: ', forgot_password_token)
    
    return {
      message: USERS_MESSAGES.CHECK_YOUR_EMAIL_FOR_RESET_PASSWORD
    }
  }
}

const userService = new UserService()
export default userService
