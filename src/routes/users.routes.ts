import { Router } from 'express'

//Middlewares import
import { 
  accessTokenValidator, 
  emailVerifyTokenValidator, 
  followValidator, 
  forgotPasswordValidator, 
  loginValidator, 
  refreshTokenValidator, 
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
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
  getMeController,
  updateMeController,
  getProfileController,
  followController,
  unfollowController
} from '../controllers/users.controller'

import { wrapRequestHandler } from '~/utils/handlers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { UpdateMeRequestBody } from '~/models/requests/users.requests'

const usersRouter = Router()

/**
 * Description: Login an exsisting user
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

/*
 * Description: Update my profile
 * Path: /me
 * Method: PATCH
 * Headers: { Authorization: Bearer <access_token> }
*/
usersRouter.patch(
  '/me', 
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeRequestBody>([
    'name', 
    'date_of_birth', 
    'bio', 
    'location', 
    'website', 
    'username', 
    'avatar', 
    'cover_photo',
  ]), 
  wrapRequestHandler(updateMeController)
) 

/*
 * Description: Get user profile
 * Path: /:username
 * Method: GET
*/
usersRouter.get(
  '/:username', 
  wrapRequestHandler(getProfileController)
) 

/*
 * Description: Follow someone
 * Path: /follow
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { followed_user_id: string }
*/
usersRouter.post(
  '/follow', 
  accessTokenValidator,
  // verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
) 

/*
 * Description: Unfollow someone
 * Path: /follow/:username 
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
*/
usersRouter.delete(
  '/follow/:user_id', 
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandler(unfollowController)
) 

export default usersRouter