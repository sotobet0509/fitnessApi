import { Router } from 'express'
import { BundleController } from '../controllers/bundle'
import * as h from 'express-async-handler'


const BundleRouter = Router({ mergeParams: true })

BundleRouter.get('/:bundle_id', h(BundleController.getBundle))
BundleRouter.get('/', h(BundleController.getAllBundles))

export { BundleRouter }