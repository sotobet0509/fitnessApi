import { Request, Response, NextFunction } from 'express'
import { ErrorResponse } from '../errors/ErrorResponse'

export default function EndpointNotFound(req: Request, res: Response, next: NextFunction) {
  throw new ErrorResponse(404, 0, 'Endpoint not found')
}
