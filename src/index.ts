import { defaultErrorHandler } from './middlewares/error.middlewares'

import express from 'express'
import usersRouter from './routes/users.routes'
import DatabaseService from './services/database.services'

DatabaseService.connect()

const app = express()
const port = 3000

app.use(express.json())
app.use('/users', usersRouter)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

