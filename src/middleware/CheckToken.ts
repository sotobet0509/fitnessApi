import { Response, NextFunction } from 'express'
import { TokenService } from '../services/token'
import { ErrorResponse } from '../errors/ErrorResponse'
import { getRepository } from 'typeorm'
import { Usuario } from '../entities/Usuarios'
import { ExtendedRequest } from '../../types'
export async function checkToken(req: ExtendedRequest, res: Response, next: NextFunction) {
  //
  const token = req.header('Authorization')
  if (!token) throw new ErrorResponse(403, 8, 'Forbidden')
  const payload = await TokenService.verifyToken(token)
  const userRepository = getRepository(Usuario)
  const user = await userRepository.findOne(payload.sub)
  if (!user) {
    //Somebody came with a signed token of a non existent user WTF
    throw new ErrorResponse(403, 8, 'Forbidden')
  }

  req.user = user

  next()
}


