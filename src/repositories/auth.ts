import { getRepository, getConnection } from 'typeorm'
import { Usuario } from '../entities/Usuarios'
import { LocalSignUpData, LocalLoginData, AdminSignupData, ChangePasswordSchema, ChangePasswordManualSchema } from '../interfaces/auth'
import { PasswordService } from '../services/password'
import { TokenService } from '../services/token'
import { ErrorResponse } from '../errors/ErrorResponse'
// import { sendActivationUrl, sendRecoveryPasswordMail } from '../services/mail'
import { v4 as uuidv4 } from 'uuid'



export const AuthRepository = {

    async createCustomerLocal(data: LocalSignUpData) {
      const customerRepository = getRepository(Usuario)
      //Revisar si existe ese email
      const exists = await customerRepository.findOne({
        where: {
          email: data.email,
        },
      })
  
      if (exists) throw new ErrorResponse(403, 6, 'Email already registered')
  
      let customer = new Usuario()
      customer.nombre = data.nombre
      customer.fechaNacimiento=data.fecha_nacimiento
      customer.email = data.email.toLocaleLowerCase()
      customer.Foto=null
      //Hash Password
      const passwordService = new PasswordService(data.password)
      const password = await passwordService.getHashedPassword()
      customer.contrasena = password
      customer.esAdministrador=false
      customer.genero=data.genero
      customer.activo=true
      customer.seccion_ejercicios=false
  
    //   //First time token
    //   const token = TokenService.generateConfirmationToken()
    //   customer.tempToken = token
  
      //Save
      await customerRepository.save(customer)
  
    //   await sendActivationUrl(customer.email, customer.tempToken)
      return customer
  
  
  
    },

  
    async authenticateCustomer(data: LocalLoginData) {
      const customerRepository = getConnection().getRepository(Usuario)
      const customer = await customerRepository.findOne({
        where: {
          email: data.email.toLocaleLowerCase(),
          activo : true
        },
      })
  
      if (!customer?.contrasena) throw new ErrorResponse(403, 4, 'Invalid Credentials')
  
      const passwordService = new PasswordService(data.password)
  
      const valid = await passwordService.compareHashedPassword(customer.contrasena)
  
      if (!valid ) throw new ErrorResponse(403, 4, 'Invalid Credentials')
      return customer
    },
  
    async recoveryPassword(data: AdminSignupData) {
      const userRepository = getRepository(Usuario)
      let user = await userRepository.findOne({
        where: {
          email: data.email
        }
      })
      if (user) {
        user.tempToken = uuidv4()
        await userRepository.save(user)
        // await sendRecoveryPasswordMail(user.email, user.tempToken)
      }
  
  
    },
  
    async changePassword(data: ChangePasswordSchema) {
      const userRepository = getRepository(Usuario)
      let user = await userRepository.findOne({
  
        where: {
          tempToken: data.tempToken
        }
      })
      if (!user) throw new ErrorResponse(404, 14, 'El usuario no existe')
  
      //Hash Password
      const passwordService = new PasswordService(data.password)
      const password = await passwordService.getHashedPassword()
  
      user.contrasena = password
      user.tempToken = null
  
      await userRepository.save(user)
      return user
    },
  
    async verifyEmail(mail: string) {
      let available = true
  
      const emailExist = await getRepository(Usuario).findOne({
        where: {
          email: mail
        }
      })
      if (emailExist) available = false
  
      return available
    },
  
    async changePasswordManual(data: ChangePasswordManualSchema) {
      const userRepository = getRepository(Usuario)
      let user = await userRepository.findOne({
        where: {
          id: data.clientId
        }
      })
      if (!user) throw new ErrorResponse(404, 14, 'El usuario no existe')
  
      //Hash Password
      const passwordService = new PasswordService(data.password)
      const password = await passwordService.getHashedPassword()
  
      user.contrasena = password
      await userRepository.save(user)
    }

  }

