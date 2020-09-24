import { Request, Response } from 'express'
import axios from 'axios'
import Joi = require('@hapi/joi')
import config from '../config'
import { FacebookLoginRequest, GoogleLoginRequest, LocalSignUpData, LocalLoginData } from '../interfaces/auth'
import { DataMissingError } from '../errors/DataMissingError'
import { ErrorResponse } from '../errors/ErrorResponse'
import { AuthRepository } from '../repositories/auth'
import { TokenService } from '../services/token'

export const 
AuthController = {
    async signUp(req: Request, res: Response) {
        const localLoginSchema = Joi.object().keys({
          email: Joi.string().required(),
          name: Joi.string().required(),
          lastname: Joi.string().required(),
          password: Joi.string().required(),
        })
        const { error, value } = localLoginSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <LocalSignUpData>value
    
        const customer = await AuthRepository.createCustomerLocal(data)
    
        //Dar acceso
        const customerToken = new TokenService(customer.id)
        const token = await customerToken.signToken()
    
        customer.password = undefined
    
        return res.json({
          success: true,
          token,
          customer,
        })
      },

}
