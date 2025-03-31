import { 
  validationResult, 
  ValidationChain 
} 
from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import ErrorWithStatus, { EntityError } from '~/models/Errors'

import express from 'express'
import HTTP_STATUS from '~/constants/httpStatus'

// can be reused by many routes
export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    
    await validations.run(req)

    const errors = validationResult(req)
    //If no error then continue request
    if (errors.isEmpty()) {
      return next()
    }
    
    const errorsObject = errors.mapped() // Converts errors to an object
    const entityError = new EntityError({ errors: {}})

    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      //Return error that is not validate error
      if (msg instanceof ErrorWithStatus && msg.status != HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.errors[key] = errorsObject[key]
    }
    

    //If no errors, proceed to the next()
    next(entityError)
  }
}