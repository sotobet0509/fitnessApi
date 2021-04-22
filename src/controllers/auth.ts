import { Request, Response } from 'express'
import axios from 'axios'
import Joi = require('@hapi/joi')
import config from '../config'
import { FacebookLoginRequest, GoogleLoginRequest, LocalSignUpData, LocalLoginData, AdminSignupData, ChangePasswordSchema, ChangePasswordManualSchema } from '../interfaces/auth'
import { DataMissingError } from '../errors/DataMissingError'
import { ErrorResponse } from '../errors/ErrorResponse'
import { AuthRepository } from '../repositories/auth'
import { TokenService } from '../services/token'
import { ExtendedRequest } from '../../types'
import { User } from '../entities/Users'
import { getRepository } from 'typeorm'


export const
  AuthController = {
    async signUp(req: Request, res: Response) {
      const localLoginSchema = Joi.object().keys({
        email: Joi.string().required(),
        name: Joi.string().required(),
        lastname: Joi.string().required(),
        password: Joi.string().required(),
      })


      let user = null
      const haveToken = req.header('Authorization')
      if (haveToken) {
        const payload = await TokenService.verifyToken(haveToken)
        const userRepository = getRepository(User)
        user = await userRepository.findOne(payload.sub)
      }


      const { error, value } = localLoginSchema.validate(req.body)
      if (error) throw new DataMissingError()
      const data = <LocalSignUpData>value

      const customer = await AuthRepository.createCustomerLocal(data, user)

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
        let user = null
        const haveToken = req.header('Authorization')
        if (haveToken) {
          const payload = await TokenService.verifyToken(haveToken)
          const userRepository = getRepository(User)
          user = await userRepository.findOne(payload.sub)
        }
        if (!customer) customer = await AuthRepository.createCustomerFromFacebook(data, user)
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

      const user = await AuthRepository.authenticateCustomer(data)

      //Dar acceso
      const userToken = new TokenService(user.id)
      const token = await userToken.signToken()

      delete user.password

      return res.json({
        success: true,
        token,
        user,
      })
    },

    async recoveryPassword(req: Request, res: Response) {
      const userEmail = Joi.object().keys({
        email: Joi.string().required()
      })
      const { error, value } = userEmail.validate(req.body)
      if (error) throw new DataMissingError()
      const data = <AdminSignupData>value

      await AuthRepository.recoveryPassword(data)

      return res.json({ success: true })
    },

    async changePassword(req: Request, res: Response) {
      const changePasswordSchema = Joi.object().keys({
        tempToken: Joi.string().required(),
        password: Joi.string().required()
      })

      const { error, value } = changePasswordSchema.validate(req.body)
      if (error) throw new DataMissingError()
      const data = <ChangePasswordSchema>value

      const user = await AuthRepository.changePassword(data)

      //Dar acceso
      const userToken = new TokenService(user.id)
      const token = await userToken.signToken()

      delete user.password

      return res.json({
        success: true,
        user,
        token
      })
    },

    async verifyEmail(req: Request, res: Response) {
      const mail = req.params.mail

      const available = await AuthRepository.verifyEmail(mail)

      return res.json({
        success: true,
        available
      })
    },


    async changePasswordManual(req: ExtendedRequest, res: Response) {
      if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
      const changePasswordSchema = Joi.object().keys({
        password: Joi.string().required(),
        clientId: Joi.string().required()
      })

      const { error, value } = changePasswordSchema.validate(req.body)
      if (error) throw new DataMissingError()
      const data = <ChangePasswordManualSchema>value

      await AuthRepository.changePasswordManual(data)


      return res.json({
        success: true,
      })
    },

    async loginColaborador(req: Request, res: Response) {
      const localLoginSchema = Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
      })

      const { error, value } = localLoginSchema.validate(req.body)
      if (error) throw new DataMissingError()
      const data = <LocalLoginData>value

      const user = await AuthRepository.authenticateColaborador(data)

      //Dar acceso
      const userToken = new TokenService(user.id.toString())
      const token = await userToken.signToken()

      delete user.password

      return res.json({
        success: true,
        token,
        user,
      })
    },

    async loginInstructor(req: Request, res: Response) {
      const localLoginSchema = Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
      })

      const { error, value } = localLoginSchema.validate(req.body)
      if (error) throw new DataMissingError()
      const data = <LocalLoginData>value

      const instructor = await AuthRepository.authenticateInstructor(data)

      //Dar acceso
      const instructorToken = new TokenService(instructor.id.toString())
      const token = await instructorToken.signToken()

      delete instructor.password

      return res.json({
        success: true,
        token,
        instructor,
      })
    },
  }
