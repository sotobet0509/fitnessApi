import { Router } from 'express'
import * as h from 'express-async-handler'
import { FolioController } from '../controllers/folio'
import {checkColaboradorToken, checkToken} from '../middleware/CheckToken'


const FolioRouter = Router({ mergeParams: true })

FolioRouter.get('/',h(checkColaboradorToken), h(FolioController.getFolios))

FolioRouter.patch('/:folio_id', h(checkColaboradorToken), h(FolioController.redeemFolio))

export { FolioRouter }