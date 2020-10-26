import { Router } from 'express'
import * as h from 'express-async-handler'
import { VersionController } from '../controllers/version'
import {checkToken} from '../middleware/CheckToken'


const VersionRouter = Router({ mergeParams: true })

VersionRouter.get('/', h(VersionController.getLastVersion))


export { VersionRouter }