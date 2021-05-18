import { SignOptions } from 'jsonwebtoken'
import * as jwt from 'jsonwebtoken'
import { ErrorResponse } from '../errors/ErrorResponse'
import config from '../config'

export class TokenService {
  customerId: string
  constructor(customerId: string) {
    this.customerId = customerId
  }

  async signToken() {
    const payload = { sub: this.customerId }
    const token = await TokenService.generateAndSign(payload, {
      expiresIn: '14d',
    })
    return token
  }

  async signTokenLider() {
    const payload = { sub: this.customerId }
    const token = await TokenService.generateAndSign(payload, {
      expiresIn: '12h',
    })
    return token
  }

  private static generateAndSign(payload: object, signOptions: SignOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, process.env.JWT_PRIVATE_KEY, { ...signOptions, algorithm: `${config.encryptionToken}` }, (err, token) => {
        if (err) reject(new ErrorResponse(500, 500, 'Internal Server Error'))
        else resolve(token)
      })
    })
  }

  static verifyToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_PUBLIC_KEY, { algorithms: `${config.encryptionToken}` }, (err, payload: any) => {
        
        if (err){
          reject(new ErrorResponse(403, 5, 'Not valid token'))
        }       
        else resolve(payload)
      })
    })
  }

  static generateConfirmationToken() {
    let token = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
    return token
  }
}
