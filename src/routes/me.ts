import { Router } from 'express'
import { MeController } from '../controllers/me'
import * as h from 'express-async-handler'
import {checkToken} from '../middleware/CheckToken'

const MeRouter = Router({ mergeParams: true })
MeRouter.get('/', h(checkToken), h(MeController.profile))
MeRouter.get('/history', h(checkToken), h(MeController.history))
MeRouter.get('/classes', h(checkToken), h(MeController.classes))

export { MeRouter }