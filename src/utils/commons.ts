import { USERS_MESSAGES } from "~/constants/messages"
import { verifyToken } from "./jwt"
import { capitalize } from "lodash"
import { JsonWebTokenError } from "jsonwebtoken"
import { Request } from 'express'
import { envConfig } from "~/constants/config"

import HTTP_STATUS from "~/constants/httpStatus"
import ErrorWithStatus from "~/models/Errors"

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value == 'number')
}

export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  try {
    const decoded_authorization = await verifyToken({
      token: access_token,
      secretOrPublicKey: envConfig.jwtSecretAccessToken as string
    })
    if(req) {
      req.decoded_authorization = decoded_authorization
      return true
    }
    return decoded_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      message: capitalize((error as JsonWebTokenError).message),
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
}