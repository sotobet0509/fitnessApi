import { Router } from 'express'
import * as h from 'express-async-handler'
import {ImageController } from '../controllers/image'

const ImageRouter = Router({ mergeParams: true })

ImageRouter.get('/', h(ImageController.getHomeImages))
ImageRouter.post('/', h(ImageController.uploadImage))
ImageRouter.patch('/', h(ImageController.changeImageStatus))
export { ImageRouter }