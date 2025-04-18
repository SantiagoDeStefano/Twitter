import { defaultErrorHandler } from './middlewares/error.middlewares'

import express from 'express'
import usersRouter from './routes/users.routes'
import DatabaseService from './services/database.services'
import mediasRouter from './routes/medias.routes'

DatabaseService.connect()

const app = express()
const port = 4000

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
