import { Request } from 'express'
import { Usuario } from './src/entities/Usuarios'

export interface ExtendedRequest extends Request {
  user: Usuario
}
