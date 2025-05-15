import { 
  Request, 
  Response, 
  NextFunction, 
  RequestHandler 
} 
from "express"

export const wrapRequestHandler = <P>(func: RequestHandler<P, any, any, any>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    }
    catch(error) {
      console.log("Error: ", error)
      next(error)
    }
  }
}

// Mong muốn nhận vào là: Request<{ username : string }>
// Thực nhận: Request<{[key: string]: string}>
