import {} from 'express'
import { TokenPayload } from './models/requests/users.requests'

import User from './models/schemas/user.schema'

declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload       
  }
}

