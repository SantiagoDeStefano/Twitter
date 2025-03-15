import { 
  Collection, 
  Db, 
  MongoClient, 
  ServerApiVersion } from 'mongodb'
import { config } from 'dotenv'
import User from '../models/schemas/user.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'

config()
const uri = 'mongodb+srv://PhamKhoiNguyen:47444128072005@cluster0.mhe4u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

class databaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = client
    this.db = this.client.db('test')
  }

  async connect() {
    try {
      // Connect the client to the server
      await client.connect()
      // Send a ping to confirm a successful connection
      await client.db('admin').command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error ', error)
      throw error
    }
  }

  get user(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION || 'users')
  }

  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN || 'refresh_tokens')
  }
}

const DatabaseService = new databaseService()
export default DatabaseService