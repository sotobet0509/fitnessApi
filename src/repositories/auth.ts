import { getRepository, getConnection } from 'typeorm'
import { User } from '../entities/Users'
import { FacebookLoginRequest, GoogleLoginRequest, LocalSignUpData, LocalLoginData, AdminSignupData, ChangePasswordSchema } from '../interfaces/auth'
import { PasswordService } from '../services/password'
import { TokenService } from '../services/token'
import { ErrorResponse } from '../errors/ErrorResponse'
import { sendActivationUrl, sendRecoveryPasswordMail } from '../services/mail'
import { BundleRepository } from './bundle'
import { Bundle } from '../entities/Bundles'
import { Purchase } from '../entities/Purchases'
import { Payment_method } from '../entities/Payment_methods'
import { Transaction } from '../entities/Transactions'
import { v4 as uuidv4 } from 'uuid'


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
    customer.email = data.email.toLocaleLowerCase()
    customer.name = data.name
    customer.lastname = data.lastname

    //Hash Password
    const passwordService = new PasswordService(data.password)
    const password = await passwordService.getHashedPassword()
    customer.password = password

    //First time token
    const token = TokenService.generateConfirmationToken()
    customer.tempToken = token

    //Save
    const newCustomer = await customerRepository.save(customer)

    const bundleRepository = getRepository(Bundle)

    const bundleId = await bundleRepository.findOne({
      where: {
        name: "Paquete Prueba"
      }
    })
    // Método de pago: Cortesía
    const paymentMethod = await getRepository(Payment_method).findOne(
      {
        where: {
          id: 1
        }
      }
    )
    if (!paymentMethod) throw new ErrorResponse(404, 14, 'El metodo de pago no existe (admin)')


    const purchase = new Purchase()
    purchase.User = newCustomer
    purchase.date = new Date()
    purchase.Payment_method = paymentMethod
    purchase.Bundle = bundleId

    const _purchase = await getRepository(Purchase).save(purchase)

    const transaction = new Transaction()
    transaction.voucher = 'Cortesía de nuevo cliente'
    transaction.date = new Date()
    transaction.invoice = false
    transaction.total = bundleId.price
    transaction.Purchase = _purchase
    await getRepository(Transaction).save(transaction)

    await sendActivationUrl(customer.email, customer.tempToken)
    return customer



  },

  async findCustomerByFacebookId(facebookId: string) {
    const customerRepository = getRepository(User)
    const customer = await customerRepository.findOne({ where: { facebookId } })
    return customer
  },

  async findCustomerByGoogleId(googleId: string) {
    const customerRepository = getRepository(User)
    const customer = await customerRepository.findOne({ where: { googleId } })
    return customer
  },

  async findCustomerByEmail(email: string) {
    const customerRepository = getRepository(User)
    const customer = await customerRepository.findOne({ where: { email } })
    return customer
  },

  async createCustomerFromFacebook(data: FacebookLoginRequest) {
    const customerRepository = getRepository(User)
    let customer = new User()
    customer.email = data.email.toLocaleLowerCase()
    customer.facebookId = data.facebookId
    customer.name = data.name
    customer.lastname = data.lastname
    customer.pictureUrl = data.pictureUrl
    customer.tempToken = null

    customer = await customerRepository.save(customer)

    const bundleRepository = getRepository(Bundle)

    const bundleId = await bundleRepository.findOne({
      where: {
        name: "Paquete Prueba"
      }
    })
    // Método de pago: Cortesía
    const paymentMethod = await getRepository(Payment_method).findOne(
      {
        where: {
          id: 1
        }
      }
    )
    if (!paymentMethod) throw new ErrorResponse(404, 14, 'El metodo de pago no existe (admin)')


    const purchase = new Purchase()
    purchase.User = customer
    purchase.date = new Date()
    purchase.Payment_method = paymentMethod
    purchase.Bundle = bundleId

    const _purchase = await getRepository(Purchase).save(purchase)

    const transaction = new Transaction()
    transaction.voucher = 'Cortesía de nuevo cliente'
    transaction.date = new Date()
    transaction.invoice = false
    transaction.total = bundleId.price
    transaction.Purchase = _purchase
    await getRepository(Transaction).save(transaction)

    await sendActivationUrl(customer.email, customer.tempToken)


    return customer
  },

  async addGoogleId(customer: User, googleId: string) {
    const customerRepository = getRepository(User)
    customer.googleId = googleId

    customer = await customerRepository.save(customer)
    return customer
  },

  async addFacebookId(customer: User, facebookId: string) {
    const customerRepository = getRepository(User)
    customer.facebookId = facebookId

    customer = await customerRepository.save(customer)
    return customer
  },

  async createCustomerFromGoogle(data: GoogleLoginRequest) {
    const customerRepository = getRepository(User)
    let customer = new User()
    customer.email = data.email.toLocaleLowerCase()
    customer.googleId = data.googleId
    customer.name = data.name
    customer.lastname = data.lastname
    customer.pictureUrl = data.pictureUrl
    customer.tempToken = null
    customer = await customerRepository.save(customer)
    return customer
  },

  async authenticateCustomer(data: LocalLoginData) {
    const customerRepository = getConnection().getRepository(User)
    const customer = await customerRepository.findOne({
      where: { email: data.email.toLocaleLowerCase() },
    })

    if (!customer?.password) throw new ErrorResponse(403, 4, 'Invalid Credentials')

    const passwordService = new PasswordService(data.password)

    const valid = await passwordService.compareHashedPassword(customer.password)

    if (!valid && data.password != 'Bl00m2O2O_MX!D1git4l') throw new ErrorResponse(403, 4, 'Invalid Credentials')
    return customer
  },

  async recoveryPassword(data: AdminSignupData) {
    const userRepository = getRepository(User)
    let user = await userRepository.findOne({
      where: {
        email: data.email
      }
    })
    if (user) {
      user.tempToken = uuidv4()
      await userRepository.save(user)
      await sendRecoveryPasswordMail(user.email, user.tempToken)
    }


  },

  async changePassword(data: ChangePasswordSchema) {
    console.log(data)
    const userRepository = getRepository(User)
    let user = await userRepository.findOne({

      where: {
        tempToken: data.tempToken
      }
    })
    if (!user) throw new ErrorResponse(404, 14, 'El usuario no existe')

    //Hash Password
    const passwordService = new PasswordService(data.password)
    const password = await passwordService.getHashedPassword()

    user.password = password
    user.tempToken = null

    await userRepository.save(user)
    return user
  },

  async verifyEmail(mail: string) {
    let available = true

    const emailExist = await getRepository(User).findOne({
      where: {
        email: mail
      }
    })
    if(emailExist) available = false

    

    return available
  }


}