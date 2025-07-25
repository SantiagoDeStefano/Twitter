import jwt from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/users.requests';

export const signToken = ({
  payload, 
  privateKey,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object,
  privateKey: string,
  options?: jwt.SignOptions
}) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if(error) {
        throw reject(error)
      }
      resolve(token as string)
    })
  })
}

export const verifyToken = ({
  token, 
  secretOrPublicKey
}: {
  token: string, 
  secretOrPublicKey: string
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if(error) {
        throw reject(error)
      }
      resolve(decoded as TokenPayload)
    })
  })
}