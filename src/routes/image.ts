import { Router } from 'express'
import * as h from 'express-async-handler'
import {ImageController } from '../controllers/image'

const ImageRouter = Router({ mergeParams: true })

ImageRouter.get('/', h(ImageController.getBackgroundImages))

export { ImageRouter }