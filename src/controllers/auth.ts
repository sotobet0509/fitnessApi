import { Request, Response } from 'express'
import axios from 'axios'
import Joi = require('@hapi/joi')
import config from '../config'
import { LocalSignUpData, LocalLoginData, AdminSignupData, ChangePasswordSchema, ChangePasswordManualSchema } from '../interfaces/auth'
import { DataMissingError } from '../errors/DataMissingError'
import { ErrorResponse } from '../errors/ErrorResponse'
import { AuthRepository } from '../repositories/auth'
import { TokenService } from '../services/token'
import { ExtendedRequest } from '../../types'
import { Usuario } from '../entities/Usuarios'
import { getRepository } from 'typeorm'
import { PasswordService } from '../services/password'


export const
  AuthController = {
    async signUp(req: Request, res: Response) {
      const localLoginSchema = Joi.object().keys({
        nombre: Joi.string().required(),
        fecha_nacimiento:Joi.string().required(),
        genero: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
      })


      const { error, value } = localLoginSchema.validate(req.body)
      console.log(error)
      if (error) throw new DataMissingError()
      const data = <LocalSignUpData>value

      const customer = await AuthRepository.createCustomerLocal(data)

      //Dar acceso
      const customerToken = new TokenService(customer.idUsuario)
      const token = await customerToken.signToken()

      customer.contrasena = undefined

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
      const userToken = new TokenService(user.idUsuario)
      const token = await userToken.signToken()

      delete user.contrasena

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
      const userToken = new TokenService(user.idUsuario)
      const token = await userToken.signToken()

      delete user.contrasena

      return res.json({
        success: true,
        user,
        token
      })
    },




   

   
  }
