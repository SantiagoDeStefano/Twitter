import { ChangePasswordRequest, RegisterRequestBody, UpdateMeRequestBody } from '~/models/requests/users.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { generateStrongPassword } from '~/utils/randompassword'
import { sendForgotPasswordEmail, sendVerifyRegisterEmail } from '~/utils/email'
import { envConfig } from '~/constants/config'

import RefreshToken from '~/models/schemas/RefreshToken.schema'
import User from '~/models/schemas/User.schema'
import DatabaseService from './database.services'
import ErrorWithStatus from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import Follower from '~/models/schemas/Follower.schema'
import axios from 'axios'

class UserService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: envConfig.jwtSecretAccessToken as string,
      options: {
        expiresIn: envConfig.accessTokenExpiresIn as any
      }
    }) as Promise<string>
  }

  private signRefreshToken({
    user_id,
    verify,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    exp?: number
  }): Promise<string> {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          token_type: TokenType.RefreshToken,
          verify,
          exp
        },
        privateKey: envConfig.jwtSecretRefreshToken as string
      }) as Promise<string>
    }
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: envConfig.jwtSecretRefreshToken as string,
      options: {
        expiresIn: envConfig.refreshTokenExpiresIn as any
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

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: envConfig.jwtSecretRefreshToken as string
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: envConfig.jwtSecretEmailVerifyToken as string,
      options: {
        expiresIn: envConfig.emailVerifyTokenExpiresIn as any
      }
    }) as Promise<string>
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify: verify })

    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    await DatabaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token,
        iat,
        exp
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

    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    await DatabaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token,
        iat,
        exp
      })
    )

    // Flow verify email
    // 1. Server sending email to user
    // 2. User click link inside email body
    // 3. Client send request to server with email_verify_token
    // 4. Server verify user with user's email_verify_token
    // 5. Send access_token and refresh_token to Client

    console.log('Register method has sent an email')
    await sendVerifyRegisterEmail(payload.email, email_verify_token)

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

  async refreshToken({
    user_id,
    refresh_token,
    verify,
    exp
  }: {
    user_id: string
    refresh_token: string
    verify: UserVerifyStatus
    exp: number
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp }),
      DatabaseService.refreshToken.deleteOne({ token: refresh_token })
    ])

    const decoded_refresh_token = await this.decodeRefreshToken(new_refresh_token)

    await DatabaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: new_refresh_token,
        iat: decoded_refresh_token.iat,
        exp: decoded_refresh_token.exp
      })
    )
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
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

    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    await DatabaseService.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token,
        iat,
        exp
      })
    )

    return {
      access_token,
      refresh_token
    }
  }

  async resendEmailVerifyToken(user_id: string, email: string) {
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })

    // Sending verify email
    await sendVerifyRegisterEmail(email, email_verify_token)

    // Update email_verify_token in database
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
      privateKey: envConfig.jwtSecretForgotPasswordToken as string,
      options: {
        expiresIn: envConfig.forgotPasswordTokenExpiresIn as any
      }
    }) as Promise<string>
  }

  async forgotPassword({ user_id, verify, email }: { user_id: string; verify: UserVerifyStatus; email: string }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })
    await DatabaseService.user.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgot_password_token,
          updated_at: '$$NOW'
        }
      }
    ])

    // Sending email https://twitter.com/forgot-password?token=token
    await sendForgotPasswordEmail(email, forgot_password_token)

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
    if (follower == null) {
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

  async changePassword(user_id: string, new_password: string) {
    await DatabaseService.user.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(new_password)
        }
      }
    )
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: envConfig.googleClientId,
      client_secret: envConfig.googleClientSecret,
      redirect_uri: envConfig.googleRedirectUri,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
    }
  }

  async oauth(code: string) {
    const { access_token, id_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    //Check if email exitst or not
    const user = await DatabaseService.user.findOne({ email: userInfo.email })
    //If exists, login
    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })

      const { iat, exp } = await this.decodeRefreshToken(refresh_token)

      await DatabaseService.refreshToken.insertOne(
        new RefreshToken({
          //Because user._id itself is ObjectId
          user_id: user._id,
          token: refresh_token,
          iat,
          exp
        })
      )
      return {
        access_token,
        refresh_token,
        newUser: 0,
        verify: user.verify
      }
    }
    //If not exists, register
    else {
      const random_password = generateStrongPassword()
      const data = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        date_of_birth: new Date().toISOString(),
        password: random_password,
        confirm_password: random_password
      })
      return {
        ...data,
        newUser: 1,
        verify: UserVerifyStatus.Unverified
      }
    }
  }
}

const userService = new UserService()
export default userService
