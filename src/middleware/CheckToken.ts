import { Response, NextFunction } from 'express'
import { TokenService } from '../services/token'
import { ErrorResponse } from '../errors/ErrorResponse'
import { getRepository } from 'typeorm'
import { User } from '../entities/Users'
import { ExtendedRequest } from '../../types'
export async function checkToken(req: ExtendedRequest, res: Response, next: NextFunction) {
  //
  const token = req.header('Authorization')
  if (!token) throw new ErrorResponse(403, 8, 'Forbidden')
  const payload = await TokenService.verifyToken(token)
  next()
}
