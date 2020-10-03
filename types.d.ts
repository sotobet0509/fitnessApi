import { Request } from 'express'
import { User } from './src/entities/Users'

export interface ExtendedRequest extends Request {
  user: User
}