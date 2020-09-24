import { Router } from 'express'
import { AuthController } from '../controllers/auth'
import * as h from 'express-async-handler'

const AuthRouter = Router({ mergeParams: true })
AuthRouter.post('/signup', h(AuthController.signUp))

export { AuthRouter }