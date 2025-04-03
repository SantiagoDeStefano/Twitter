import { 
  Request, 
  Response, 
  NextFunction 
} 
from 'express';

import { pick } from 'lodash';

//Tao ra 1 cai mang ma trong cai mang day co nhung cai item cua thang T
type FilterKeys<T> = Array<keyof T>;
export const filterMiddleware = <T>(filterKeys: FilterKeys<T>) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.body = pick(req.body, filterKeys);
  next();
}