import { defaultErrorHandler } from './middlewares/error.middlewares'
import { initFolder } from './utils/file'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import { config } from 'dotenv'

import express from 'express'
import usersRouter from './routes/users.routes'
import DatabaseService from './services/database.services'
import mediasRouter from './routes/medias.routes'
import staticRouter from './routes/static.routes'
import cors from 'cors'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import likeRoutes from './routes/likes.routes'
import searchRouter from './routes/search.routes'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { ObjectId } from 'mongodb'
import Conversation from './models/schemas/Conversations.schema'
import conversationsRouter from './routes/conversations.routes'
// import '~/utils/s3'
// import '~/utils/fake'

config()

DatabaseService.connect().then(() => {
  DatabaseService.indexUser()
  DatabaseService.indexRefreshToken()
  DatabaseService.indexFollowers()
  DatabaseService.indexVideoStatus()
  DatabaseService.indexTweets()
})

const app = express()

const httpServer = createServer(app)

app.use(cors())
const port = process.env.PORT

// Create upload folder
initFolder()

console.log(UPLOAD_IMAGE_DIR)

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likeRoutes)
app.use('/search', searchRouter)
app.use('/conversations', conversationsRouter)

app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

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

io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected`)
  const user_id = socket.handshake.auth._id
  users[user_id] = {
    socket_id: socket.id
  }
  socket.on('private_message', async (data) => {
    const { receiver_id, sender_id, content } = data.payload
    const receiver_socket_id = users[receiver_id]?.socket_id
    if (!receiver_socket_id) {
      return
    }

    const conversation = new Conversation({
      sender_id: new ObjectId(sender_id),
      receiver_id: new ObjectId(receiver_id),
      content: content
    })
    const result = await DatabaseService.conversations.insertOne(conversation)
    conversation._id = result.insertedId

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

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
