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

io.on('connection', (socket) => {
  socket.emit("user_connection", socket.id)
  socket.on("hello_to_server", (args) => {
    console.log(args)
  })
})

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
