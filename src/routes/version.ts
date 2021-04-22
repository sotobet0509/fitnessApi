import { Router } from 'express'
import * as h from 'express-async-handler'
import { VersionController } from '../controllers/version'

const VersionRouter = Router({ mergeParams: true })

VersionRouter.get('/:version', h(VersionController.getLastVersion))


export { VersionRouter }