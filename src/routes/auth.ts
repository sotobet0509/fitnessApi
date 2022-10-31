import { Router } from 'express'
import * as h from 'express-async-handler'
import { AuthController } from '../controllers/auth'

const AuthRouter = Router({ mergeParams: true })
AuthRouter.post('/login', h(AuthController.login))
AuthRouter.post('/signup', h(AuthController.signUp))
AuthRouter.patch('/change-password', h(AuthController.changePassword))
AuthRouter.patch('/recovery-password', h(AuthController.recoveryPassword))
export { AuthRouter }
