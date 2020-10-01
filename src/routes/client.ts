import { Router } from 'express'
import * as h from 'express-async-handler'
import { ClientController } from '../controllers/client'
import {checkToken} from '../middleware/CheckToken'


const ClientRouter = Router({ mergeParams: true })


ClientRouter.get('/', h(checkToken), h(ClientController.getAllClients))
ClientRouter.get('/:client_id',  h(checkToken), h(ClientController.getClient))
ClientRouter.post( '/', h(checkToken), h(ClientController.createClient))

export { ClientRouter }