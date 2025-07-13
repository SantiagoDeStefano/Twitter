import { ObjectId } from 'mongodb'
import { Server } from 'socket.io'
import { USERS_MESSAGES } from '~/constants/messages'
import { UserVerifyStatus } from '~/constants/enums'
import { TokenPayload } from '~/models/requests/users.requests'
import { verifyAccessToken } from './commons'
import { Server as ServerHttp } from 'http'

import HTTP_STATUS from '~/constants/httpStatus'
import Conversation from '~/models/schemas/Conversations.schema'
import ErrorWithStatus from '~/models/Errors'
import DatabaseService from '~/services/database.services'

const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    // Options
    cors: {
      origin: 'http://localhost:3000'
    }
  })
  
  const users: {
    [key: string]: {
      socket_id: string
    }
  } = {}
  
  // Authorization middlewares
  // Must be logged in and verified
  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization?.split(' ')[1]
    try {
      const decoded_authorization = await verifyAccessToken(access_token)
      const { verify } = decoded_authorization as TokenPayload
      if (verify != UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_VERIFIED,
          status: HTTP_STATUS.FORBIDDEN
        })
        // const err = new Error('User not verified')
        // ;(err as any).data = { reason: USERS_MESSAGES.USER_NOT_VERIFIED }
        // return next(err)
      }
      // Pass decoded_authorization to socket for other middlewares
      socket.handshake.auth.decoded_authorization = decoded_authorization
      socket.handshake.auth.access_token = access_token
      next()
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'UnauthorziedError',
        data: error
      })
    }
  })
  
  io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`)
    const user_id = socket.handshake.auth._id
    users[user_id] = {
      socket_id: socket.id
    }
  
    socket.use(async (packet, next) => {
      const { access_token } = socket.handshake.auth
      try {
        await verifyAccessToken(access_token)
        next()
      } catch (error) {
        next(new Error('Unauthorized'))
      }
    })
  
    socket.on('private_message', async (data) => {
      const { receiver_id, sender_id, content } = data.payload
      const receiver_socket_id = users[receiver_id]?.socket_id
  
      const conversation = new Conversation({
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id),
        content: content
      })
      const result = await DatabaseService.conversations.insertOne(conversation)
      conversation._id = result.insertedId
  
      if (!receiver_socket_id) {
        return
      }
      socket.to(receiver_socket_id).emit('received_private_message', {
        payload: conversation
      })
    })
  
    socket.on('disconnect', () => {
      delete users[user_id]
      console.log(`user ${socket.id} disconnected`)
      console.log(users)
    })
  })
}

