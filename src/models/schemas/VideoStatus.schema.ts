import { ObjectId } from "mongodb";
import { EncodingStatus } from "~/constants/enums";

interface VideoStatusType {
  _id?: ObjectId,
  name: string,
  status: EncodingStatus,
  message?: string,
  created_at?: Date,
  updated_at?: Date
}

export default class VideoStatus {
  _id?: ObjectId
  name: string
  status: EncodingStatus
  message: string
  created_at: Date
  updated_at: Date

  constructor({ _id, name, status, message, created_at, updated_at }: VideoStatusType) {
    this._id = _id
    this.name = name
    this.status = status
    this.message = message || ''
    this.created_at = new Date()
    this.updated_at = new Date()
  }
}