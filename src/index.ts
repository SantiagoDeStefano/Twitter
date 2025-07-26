import { defaultErrorHandler } from './middlewares/error.middlewares'
import { initFolder } from './utils/file'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import { config } from 'dotenv'
import { createServer } from 'http'

// import '~/utils/s3'
// import '~/utils/fake'
import staticRouter from './routes/static.routes'
import express from 'express'
import usersRouter from './routes/users.routes'
import DatabaseService from './services/database.services'
import mediasRouter from './routes/medias.routes'
import conversationsRouter from './routes/conversations.routes'
import cors from 'cors'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import likeRoutes from './routes/likes.routes'
import searchRouter from './routes/search.routes'
import YAML from 'yaml'
import fs from 'fs'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import { envConfig } from './constants/config'

const file = fs.readFileSync(path.resolve('twitter-swagger.yaml'), 'utf8')
const swaggerDocument = YAML.parse(file)

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
const port = envConfig.port

// Create upload folder
initFolder()

console.log(UPLOAD_IMAGE_DIR)

app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
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

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
