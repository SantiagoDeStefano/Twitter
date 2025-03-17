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
  VerifyForgotPasswordRequestBody 
} from '~/models/requests/users.requests'
import { USERS_MESSAGES } from '~/constants/messages'
import { UserVerifyStatus } from '~/constants/enums'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import DatabaseService from '~/services/database.services'
import User from '~/models/schemas/user.schema'
import userService from '~/services/users.services'

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginRequestBody>,
  res: Response
): Promise<void> => {
  const user = req.user as User
  const user_id = user._id as Object
  const result = await userService.login(user_id.toString())
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
  return
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

  const result = await userService.resendEmailVerifyToken(user_id)
  res.json({
    result
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response
): Promise<void> => {
  const { _id } = req.user as User
  const result = await userService.forgotPassword(_id.toString())
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
  const result = await userService.resetPassword(user_id, req.body.new_password)
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
