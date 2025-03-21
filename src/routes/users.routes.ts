import { Router } from 'express'

//Middlewares import
import { 
  accessTokenValidator, 
  emailVerifyTokenValidator, 
  forgotPasswordValidator, 
  loginValidator, 
  refreshTokenValidator, 
  registerValidator,
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator
} from '../middlewares/users.middlewares'

//Controllers import
import { 
  loginController, 
  registerController, 
  logoutController, 
  verifyEmailController, 
  resendVerifyEmailController, 
  verifyForgotPasswordController,
  forgotPasswordController,
  resetPasswordController,
  getMeController
} from '../controllers/users.controller'

import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

/**
 * Description: Register a new user
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string }
 */
usersRouter.post(
  '/login', 
  loginValidator, 
  loginController
)

/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password:string, date_of_birth: ISO8601 }
 */
usersRouter.post(
  '/register', 
  registerValidator, 
  wrapRequestHandler(registerController)
)

/**
 * Description: Register a new user
 * Path: /logout
 * Method: POST
 * Headers: { Authorization: Bearer <refresh_token> }
 * Body: { refresh_token: string }
 */
usersRouter.post(
  '/logout', 
  accessTokenValidator, 
  refreshTokenValidator, 
  wrapRequestHandler(logoutController)
) 

/**
 * Description: Verify email when user click on the link in the email
 * Path: /verify-email
 * Method: POST
 * Headers: Don't need because user can verify email without login
 * Body: { refresh_token: string }
 */
usersRouter.post(
  '/verify-email', 
  emailVerifyTokenValidator, 
  wrapRequestHandler(verifyEmailController)
) 

/**
 * Description: Verify email when user click on the link in the email
 * Path: /resend-verify-email
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: { }
 */
usersRouter.post(
  '/resend-verify-email', 
  accessTokenValidator, 
  wrapRequestHandler(resendVerifyEmailController)
) 


/**
 * Description: Submit email to reset password, then send email to user
 * Path: /forgot-password
 * Method: POST
 * Body: { email: string }
 */
usersRouter.post(
  '/forgot-password', 
  forgotPasswordValidator,
  wrapRequestHandler(forgotPasswordController)
) 


/**
 * Description: Verify link(token) in email to reset password
 * Path: /verity-forgot-password
 * Method: POST
 * Body: { forgot_password_token: string }
 */
usersRouter.post(
  '/verity-forgot-password', 
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
) 

/**
 * Description: Reset password after verify forgot password token
 * Path: /reset-password
 * Method: POST
 * Body: { new_password: string, confirm_new_password: string }
 */
usersRouter.post(
  '/reset-password', 
  resetPasswordValidator,
  wrapRequestHandler(resetPasswordController)
)

/*
 * Description: Get my profile
 * Path: /me
 * Method: GET
 * Headers: { Authorization: Bearer <access_token> }
*/
usersRouter.get(
  '/me', 
  accessTokenValidator,
  wrapRequestHandler(getMeController)
) 
export default usersRouter
