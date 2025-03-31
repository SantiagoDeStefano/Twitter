import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'

type ErrorsType = Record<
  string, // Key: any string
  {       // Value: an object with:
    msg: string  // Required field "msg" of type string
    [key: string]: any  // Additional dynamic properties of any type
  }
>

class ErrorWithStatus {
  message: string
  status: number
  constructor({ 
    message, 
    status 
  }: { 
      message: string,
      status: number }) {
    this.message = message
    this.status = status
  }
}
export default ErrorWithStatus

export class EntityError extends ErrorWithStatus {
  
  errors: ErrorsType

  constructor({ message = USERS_MESSAGES.VALIDATION_ERROR, errors }:{ message?: string; errors: ErrorsType }) {

    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })

    this.errors = errors
  }
}
