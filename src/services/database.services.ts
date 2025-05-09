import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import { config } from 'dotenv'

import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import User from '../models/schemas/User.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import { uniqueId } from 'lodash'
import Tweet from '~/models/schemas/Tweet.schema'

config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.mhe4u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri)
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

  async indexUser() {
    const exists = await this.user.indexExists([
      'email_1_password_1',
      'email_1',
      'username_1'
    ])
    if(!exists) {
      this.user.createIndex({ email: 1, password: 1 })
      this.user.createIndex({ email: 1 }, { unique: true })
      this.user.createIndex({ username: 1 }, { unique: true })
    }    
  }

  async indexRefreshToken() {
    const exists = await this.refreshToken.indexExists([
      'token_1',
      'exp_1'
    ])
    if(!exists) {
      this.refreshToken.createIndex({ token: 1 })
      this.refreshToken.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      )
    }
  }

  async indexVideoStatus() {
    const exists = await this.videoStatus.indexExists(
      'name_1'
    )
    if(!exists) {
      this.videoStatus.createIndex({ name: 1 })
    }
  }

  async indexFollowers() {
    const exists = await this.followers.indexExists(
      'user_id_1_followed_user_id_1'
    )
    if(!exists) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }

  get user(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }

  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECT as string)
  }
}

const DatabaseService = new databaseService()
export default DatabaseService
