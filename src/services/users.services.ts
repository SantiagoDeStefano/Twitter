import { RegisterRequestBody, UpdateMeRequestBody } from '~/models/requests/users.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { config } from 'dotenv'

import RefreshToken from '~/models/schemas/RefreshToken.schema'
import User from '~/models/schemas/User.schema'
import DatabaseService from './database.services'
import ErrorWithStatus from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import Follower from '~/models/schemas/Follower.schema'

config()

class UserService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as any
      }
    }) as Promise<string>
  }

  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as any
      }
    }) as Promise<string>
  }

  private async signAccessAndRefreshToken({
    user_id,
    verify
  }: {
    user_id: string
    verify: UserVerifyStatus
  }): Promise<[string, string]> {
    const access_token = await this.signAccessToken({ user_id, verify })
    const refresh_token = await this.signRefreshToken({ user_id, verify })
    return [access_token, refresh_token]
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as any
      }
    }) as Promise<string>
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify: verify })
    await DatabaseService.refreshToken.insertOne(
       new RefreshToken({ 
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await DatabaseService.user.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user${user_id.toString()}`,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await DatabaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
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
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),

      DatabaseService.user.updateOne({ _id: new ObjectId(user_id) }, [
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified,
            updated_at: '$$NOW'
          }
        }
      ])
    ])

    const [access_token, refresh_token] = tokens

    return {
      access_token,
      refresh_token
    }
  }

  async resendEmailVerifyToken(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })
    //Fake resend email
    console.log('Resend verify email: ', email_verify_token)

    //Update email_verify_token in database
    await DatabaseService.user.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token,
          updated_at: '$$NOW'
        }
      }
    ])
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  async signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as any
      }
    }) as Promise<string>
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })
    await DatabaseService.user.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgot_password_token,
          updated_at: '$$NOW'
        }
      }
    ])
    //Fake sending email https://twitter.com/forgot-password?token=token
    console.log('Forgot password token: ', forgot_password_token)

    return {
      message: USERS_MESSAGES.CHECK_YOUR_EMAIL_FOR_RESET_PASSWORD,
      forgot_password_token
    }
  }

  async getMe(user_id: string) {
    const user = await DatabaseService.user.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0
        }
      }
    )
    return user
  }

  async resetPassword(user_id: string, new_password: string) {
    await DatabaseService.user.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          password: hashPassword(new_password),
          forgot_password_token: '',
          updated_at: '$$NOW'
        }
      }
    ])
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async updateMe(user_id: string, payload: UpdateMeRequestBody) {
    //Find one and update se tra ve cho nguoi dung
    const payload_date_of_birth = payload.date_of_birth
      ? { ...payload, date_of_birth: new Date(payload.date_of_birth) }
      : payload
    const user = await DatabaseService.user.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...(payload_date_of_birth as UpdateMeRequestBody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return user
  }

  async getProfile(username: string) {
    const user = await DatabaseService.user.findOne(
      { username },
      {
        projection: {
          password: 0,
          created_at: 0,
          updated_at: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0
        }
      }
    )
    if (user === null) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user
  }

  async follow(user_id: string, followed_user_id: string) {
    const follower = await DatabaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (follower != null) {
      return {
        message: USERS_MESSAGES.ALREADY_FOLLOWED
      }
    }

    await DatabaseService.followers.insertOne(
      new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    )
    return {
      message: USERS_MESSAGES.FOLLOW_SUCCESS
    }
  }

  async unfollow(user_id: string, followed_user_id: string) {
    const follower = await DatabaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    //Can't find follower = this user_id didn't follow followed_user_id in the first place
    if(follower == null) {
      return {
        message: USERS_MESSAGES.ALREADY_UNFOLLOWED
      }
    }
    
    await DatabaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    return {
      message: USERS_MESSAGES.UNFOLLOW_SUCCESS
    }
  }
}

const userService = new UserService()
export default userService
