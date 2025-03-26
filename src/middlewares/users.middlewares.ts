import { check, checkSchema, ParamSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { USERS_MESSAGES } from '~/constants/messages'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { Request, Response, NextFunction } from 'express'
import ErrorWithStatus from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import userService from '~/services/users.services'
import DatabaseService from '~/services/database.services'
import { ObjectId } from 'mongodb'
import { TokenPayload } from '~/models/requests/users.requests'
import { UserVerifyStatus } from '~/constants/enums'

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: { min: 8, max: 16 },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_FROM_8_TO_16
  },
  isStrongPassword: {
    options: {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.STRONG_PASSWORD
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: { min: 8, max: 16 },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_FROM_8_TO_16
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_DOES_NOT_MATCH_PASSWORD)
      }
      return true
    }
  }
}

const forgotPasswordTokenSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_REQUIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        const { user_id } = decoded_forgot_password_token
        const user = await DatabaseService.user.findOne({ _id: new ObjectId(user_id) })
        if (!user) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        if (user.forgot_password_token != value) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        req.decoded_forgot_password_token = decoded_forgot_password_token
      } catch (error) {
        throw new ErrorWithStatus({
          message: capitalize((error as JsonWebTokenError).message),
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      return true
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 3,
      max: 100
    },
    errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_3_TO_100
  },
  trim: true
}

const imageSchema: ParamSchema = {
  trim: true,
  optional: true,
  isString: {
    errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 1,
      max: 400,
    },
    errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_BETWEEN_1_AND_400
  }
}

const dateOfBirthSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_IS_REQUIRED
  },
  isISO8601: {
    errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_IS_REQUIRED
  }
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await DatabaseService.user.findOne({ email: value, password: hashPassword(req.body.password) })
            if (!user) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 3,
            max: 100
          },
          errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_3_TO_100
        },
        trim: true
      },
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await userService.checkEmailExist(value)
            if (isExistEmail) {
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
  {
    Authorization: {
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              req.decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const [decode_refresh_token, refresh_token] = await Promise.all([
                verifyToken({
                  token: value,
                  secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
                }),
                DatabaseService.refreshToken.findOne({ token: value })
              ])
              if (refresh_token == null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              req.decode_refresh_token = decode_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await DatabaseService.user.findOne({ email: value })
            if (!user) {
              throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const verifiedUserValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  const { user_id } = req.decoded_authorization as TokenPayload
  console.log(user_id)
  console.log(verify)
  if (verify != UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

export const  updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.BIO_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 100,
          },
          errorMessage: USERS_MESSAGES.BIO_LENGTH_MUST_BE_BETWEEN_1_AND_100
        }
      },
      location: {
        trim: true,
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 1,
            max: 100,
          },
          errorMessage: USERS_MESSAGES.LOCATION_LENGTH_MUST_BE_BETWEEN_1_AND_100
        }
      },
      website: {
        trim: true,
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 1,
            max: 200,
          },
          errorMessage: USERS_MESSAGES.WEBSITE_LENGTH_MUST_BE_BETWEEN_1_AND_200
        }
      },
      username: {
        trim: true,
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 1,
            max: 50,
          },
          errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_BETWEEN_1_AND_50
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)
