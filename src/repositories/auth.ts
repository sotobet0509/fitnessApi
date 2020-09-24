import { getRepository, getConnection } from 'typeorm'
import { User } from '../entities/Users'
import { FacebookLoginRequest, GoogleLoginRequest, LocalSignUpData, LocalLoginData } from '../interfaces/auth'
import { PasswordService } from '../services/password'
import { TokenService } from '../services/token'
import { ErrorResponse } from '../errors/ErrorResponse'
import { sendActivationUrl } from '../services/mail'

export const AuthRepository = {
    async createCustomerLocal(data: LocalSignUpData) {
        const customerRepository = getRepository(User)
        //Revisar si existe ese email
        const exists = await customerRepository.findOne({
          where: {
            email: data.email,
          },
        })
    
        if (exists) throw new ErrorResponse(403, 6, 'Email already registered')
    
        let customer = new User()
        customer.email = data.email
        customer.name = data.name
        customer.lastname = data.lastname
    
        //Hash Password
        const passwordService = new PasswordService(data.password)
        const password = await passwordService.getHashedPassword()
        customer.password = password
    
        //First time token
        const token = TokenService.generateConfirmationToken()
        customer.temptoken = token
    
        //Save
        customer = await customerRepository.save(customer)
    
        await sendActivationUrl(customer.email, customer.temptoken)
        return customer
      },
}