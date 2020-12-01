import { Request } from 'express'
import { Alternate_users } from './src/entities/alternateUsers'
import { User } from './src/entities/Users'

export interface ExtendedRequest extends Request {
  user: User
}

export interface ExtendedRequest extends Request {
  alternateUsers: Alternate_users
}