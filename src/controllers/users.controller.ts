import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ForgotPasswordRequestBody,
  LoginRequestBody,
  LogoutRequestBody,
  ResetPasswordRequestBody,
  RegisterRequestBody,
  TokenPayload,
  VerifyEmailRequestBody,
  VerifyForgotPasswordRequestBody,
  UpdateMeRequestBody,
  GetProfileRequestParams,
  FollowRequestBody,
  UnfollowRequestParams,
  ChangePasswordRequest,
  RefreshTokenRequestBody
} from '~/models/requests/users.requests'
import { USERS_MESSAGES } from '~/constants/messages'
import { UserVerifyStatus } from '~/constants/enums'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import DatabaseService from '~/services/database.services'
import User from '~/models/schemas/User.schema'
import userService from '~/services/users.services'
import { config } from 'dotenv'

config()

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginRequestBody>,
  res: Response
): Promise<void> => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login({ user_id: user_id.toString(), verify: user.verify })
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
  return
}

export const oauthController = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.query
  const result = await userService.oauth(code as string)
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.verify}`
  return res.redirect(urlRedirect)
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response
): Promise<void> => {
  const result = await userService.register(req.body)
  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
  return
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutRequestBody>,
  res: Response
): Promise<void> => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  res.json({ result })
  return
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenRequestBody>,
  res: Response
): Promise<void> => {
  const { refresh_token } = req.body
  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload
  const result = await userService.refreshToken({ user_id, refresh_token, verify, exp })
  res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
  return
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailRequestBody>,
  res: Response
): Promise<void> => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await DatabaseService.user.findOne({
    _id: new ObjectId(user_id)
  })

  //If user not found then we return HTTP 404 Not Found
  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      error: USERS_MESSAGES.USER_NOT_FOUND
    })
    return
  }

  //Verified so we don't throw error
  //Instead, we return HTTP 200 OK with "Already verified" message
  if (user.email_verify_token == '') {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
    return
  }
  //If not verify then we assign user to req.user to use in controller
  const result = await userService.verifyEmail(user_id)
  res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await DatabaseService.user.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      error: USERS_MESSAGES.USER_NOT_FOUND
    })
    return
  }

  if (user.verify == UserVerifyStatus.Verified) {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
    return
  }

  const result = await userService.resendEmailVerifyToken(user_id, user.email)
  res.json({
    result
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response
): Promise<void> => {
  const { _id, verify, email } = req.user as User
  const result = await userService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify, email })
  res.json({
    result
  })
  return
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordRequestBody>,
  res: any,
  next: NextFunction
): Promise<void> => {
  res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>,
  res: Response
): Promise<void> => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const password = req.body.new_password
  const result = await userService.resetPassword(user_id, password)
  res.json({
    result
  })
}

export const getMeController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await userService.getMe(user_id)
  res.json({
    msg: USERS_MESSAGES.GET_ME_SUCCESS,
    result: user
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload

  //The api only allows to update these fields, preventing any unwanted fields
  const { body } = req
  const user = await userService.updateMe(user_id, body)
  res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result: user
  })
}

export const getProfileController = async (
  // req: Request<{ username: string}>,
  req: Request<GetProfileRequestParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  //req.params is the params in the url, for example: /users/:username
  //So we can get the username from req.params.username

  //Don't need username validator because username always string
  const { username } = req.params
  const user = await userService.getProfile(username)
  res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    result: user
  })
}

export const followController = async (
  req: Request<ParamsDictionary, any, FollowRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await userService.follow(user_id, followed_user_id)
  res.json({
    result
  })
  return
}

export const unfollowController = async (
  //Have the error on this line wrapRequestHandler(unfollowController)
  //Because UnfollowRequestParams have the 'user_id' while ParamsDictionary doesn't
  //Fix: extends UnfollowRequestParams with ParamsDictionary (users.requests.ts)
  req: Request<UnfollowRequestParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  const result = await userService.unfollow(user_id, followed_user_id)
  res.json({
    result
  })
}

export const changePasswordController = async (
  req: Request<ChangePasswordRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { new_password } = req.body
  const result = await userService.changePassword(user_id, new_password)
  res.json({
    result
  })
  return
}
