import { Router } from 'express'
import { BundleController } from '../controllers/bundle'
import * as h from 'express-async-handler'
//import {checkToken} from '../middleware/CheckToken'

const BundleRouter = Router({ mergeParams: true })
BundleRouter.get('/:bundle_id', h(BundleController.getBundle))

export { BundleRouter }