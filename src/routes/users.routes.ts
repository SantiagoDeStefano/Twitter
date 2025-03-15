import { Router } from 'express'
import { 
  accessTokenValidator, 
  emailVerifyTokenValidator, 
  forgotPasswordValidator, 
  loginValidator, 
  refreshTokenValidator, 
  registerValidator
} from '../middlewares/users.middlewares'
import { 
  loginController, 
  registerController, 
  logoutController, 
  verifyEmailController, 
  resendVerifyEmailController, 
  forgotPasswordController
} from '../controllers/users.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

/**
 * Description: Register a new user
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string }
 */
usersRouter.post('/login', loginValidator, loginController)

/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password:string, date_of_birth: ISO8601 }
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description: Register a new user
 * Path: /logout
 * Method: POST
 * Headers: { Authorization: Bearer <refresh_token> }
 * Body: { refresh_token: string }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController)) 

/**
 * Description: Verify email when user click on the link in the email
 * Path: /verify-email
 * Method: POST
 * Headers: Don't need because user can verify email without login
 * Body: { refresh_token: string }
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController)) 

/**
 * Description: Verify email when user click on the link in the email
 * Path: /resend-verify-email
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: { }
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController)) 


/**
 * Description: Submit email to reset password, then send email to user
 * Path: /forgot-password
 * Method: POST
 * Body: { email: string }
 */
usersRouter.post('/forgot-password', forgotPasswordValidator ,wrapRequestHandler(forgotPasswordController)) 

export default usersRouter
