import { Router } from 'express'
import * as h from 'express-async-handler'
import { ClientController } from '../controllers/client'
import { PurchaseController } from '../controllers/purchase'
import {checkToken} from '../middleware/CheckToken'


const PurchaseRouter = Router({ mergeParams: true })


PurchaseRouter.post('/client/:client_id', h(checkToken), h(PurchaseController.buy))

export { PurchaseRouter }