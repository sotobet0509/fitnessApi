import config from '../config'
import { ExtendedRequest } from '../../types'
import { Response, NextFunction } from 'express'
import { ErrorResponse } from '../errors/ErrorResponse'
import { TokenService } from '../services/token'
import { getRepository } from 'typeorm'
import { User } from '../entities/Users'

export async function InternalToken(req: ExtendedRequest, res: Response, next: NextFunction) {
  const token = req.header('Authorization')
  if (!token) throw new ErrorResponse(403, 8, 'Forbidden')
  const payload = await TokenService.verifyToken(token)

  const userRepository = getRepository(User)
  const user = await userRepository.findOne(payload.sub)
  if (!user) {
    //Somebody came with a signed token of a non existent user WTF
    throw new ErrorResponse(403, 8, 'Forbidden')
  }
  req.user = user
  next()
}
