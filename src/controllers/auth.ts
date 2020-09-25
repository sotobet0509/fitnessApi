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

    async facebook(req: Request, res: Response) {
      const facebookLoginSchema = Joi.object().keys({
        facebookId: Joi.string().required(),
        facebookToken: Joi.string().required(),
        email: Joi.string().required(),
        name: Joi.string(),
        lastname: Joi.string(),
        pictureUrl: Joi.string(),
      })
      const { error, value } = facebookLoginSchema.validate(req.body)
      if (error) throw new DataMissingError()
      const data = <FacebookLoginRequest>value

      const facebookUrl = config.facebookAuthUrl
        .replace('${facebookId}', data.facebookId)
        .replace('${facebookToken}', data.facebookToken)

      let facebookResponse: any
      try {
        facebookResponse = await axios.get(facebookUrl)
      } catch (error) {
        throw new ErrorResponse(403, 2, 'Invalid Facebook Login')
      }
      if (facebookResponse.data.id !== data.facebookId) throw new ErrorResponse(403, 2, 'Invalid Facebook Login')

      //Revisar si usuario existe en DB
      let customer = await AuthRepository.findCustomerByFacebookId(data.facebookId)
      if (!customer) {
        //Buscar por email y ver si existe
        customer = await AuthRepository.findCustomerByEmail(data.email)
        //Si no existe, crearlo
        if (!customer) customer = await AuthRepository.createCustomerFromFacebook(data)
        else customer = await AuthRepository.addFacebookId(customer, data.facebookId)
      }
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

    async google(req: Request, res: Response) {
      const googleLoginSchema = Joi.object().keys({
        googleId: Joi.string().required(),
        googleToken: Joi.string().required(),
        email: Joi.string().required(),
        name: Joi.string(),
        lastname: Joi.string(),
        pictureUrl: Joi.string(),
      })
      const { error, value } = googleLoginSchema.validate(req.body)
      if (error) throw new DataMissingError()
      const data = <GoogleLoginRequest>value

      const googleUrl = config.googleAuthUrl.replace('${googleToken}', data.googleToken)

      let googleResponse: any
      try {
        googleResponse = await axios.get(googleUrl)
      } catch (error) {
        throw new ErrorResponse(403, 3, 'Invalid Google Login')
      }

      if (googleResponse.data.sub !== data.googleId) throw new ErrorResponse(403, 3, 'Invalid Google Login')

      //Revisar si usuario existe en DB
      let customer = await AuthRepository.findCustomerByGoogleId(data.googleId)
      if (!customer) {
        //Buscar por email y ver si existe
        customer = await AuthRepository.findCustomerByEmail(data.email)
        //Si no existe, crearlo
        if (!customer) customer = await AuthRepository.createCustomerFromGoogle(data)
        else customer = await AuthRepository.addGoogleId(customer, data.googleId)
      }

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

    async login(req: Request, res: Response) {
      const localLoginSchema = Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
      })
  
      const { error, value } = localLoginSchema.validate(req.body)
      if (error) throw new DataMissingError()
      const data = <LocalLoginData>value
  
      const customer = await AuthRepository.authenticateCustomer(data)
  
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
