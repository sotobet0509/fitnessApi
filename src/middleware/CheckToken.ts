import { Response, NextFunction } from 'express'
import { TokenService } from '../services/token'
import { ErrorResponse } from '../errors/ErrorResponse'
import { getRepository } from 'typeorm'
import { User } from '../entities/Users'
import { ExtendedRequest } from '../../types'
import { BlackList } from '../entities/BlackList'
import { Alternate_users } from '../entities/alternateUsers'
import { Instructor } from '../entities/Instructors'
export async function checkToken(req: ExtendedRequest, res: Response, next: NextFunction) {
  //
  const token = req.header('Authorization')
  if (!token) throw new ErrorResponse(403, 8, 'Forbidden')
  const payload = await TokenService.verifyToken(token)
  const userRepository = getRepository(User)
  const user = await userRepository.findOne(payload.sub)
  if (!user) {
    //Somebody came with a signed token of a non existent user WTF
    throw new ErrorResponse(403, 8, 'Forbidden')
  }
  const blackListToken = await getRepository(BlackList).findOne({
    where:{
      token: token
    }
  })
  if(blackListToken) throw new ErrorResponse(403, 48, 'El token se encuentra en la BlackList') 

  req.user = user

  next()
}

export async function checkColaboradorToken(req: ExtendedRequest, res: Response, next: NextFunction) {
  //
  const token = req.header('Authorization')
  if (!token) throw new ErrorResponse(403, 8, 'Forbidden')
  const payload = await TokenService.verifyToken(token)
  const colaboradorRepository = getRepository(Alternate_users)
  const colaborador = await colaboradorRepository.findOne(payload.sub)
  if (!colaborador) {
    //Somebody came with a signed token of a non existent user WTF
    throw new ErrorResponse(403, 8, 'Forbidden')
  }

  req.alternateUsers = colaborador
  next()
}

export async function checkInstructorToken(req: ExtendedRequest, res: Response, next: NextFunction) {
  //
  const token = req.header('Authorization')
  if (!token) throw new ErrorResponse(403, 8, 'Forbidden')
  const payload = await TokenService.verifyToken(token)
  const instructorRepository = getRepository(Instructor)
  const instructor = await instructorRepository.findOne(payload.sub)
  if (!instructor) {
    //Somebody came with a signed token of a non existent user WTF
    throw new ErrorResponse(403, 8, 'Forbidden')
  }

  req.instructor = instructor
  next()
}

