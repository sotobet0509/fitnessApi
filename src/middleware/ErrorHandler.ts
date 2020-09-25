import { Request, Response, NextFunction } from 'express'
import { ErrorResponse } from '../errors/ErrorResponse'

export default function ErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ErrorResponse) {
    return res.status(err.httpCode).json({
      success: false,
      error: {
        code: err.internalCode,
        message: err.message,
      },
    })
  }

  console.log('ERROR 500', err)

  return res.status(500).json({
    success: false,
    error: {
      code: 500,
      message: 'Internal Server Error',
      data: err,
    },
  })
}
