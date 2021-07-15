import { Router } from 'express'
import * as h from 'express-async-handler'
import {ImageController } from '../controllers/image'
import { checkToken } from '../middleware/CheckToken'

const ImageRouter = Router({ mergeParams: true })

ImageRouter.get('/', h(ImageController.getHomeImages))

ImageRouter.get('/all', h(ImageController.getAllImages))

ImageRouter.post('/',h(checkToken), h(ImageController.uploadImage))

ImageRouter.patch('/',h(checkToken), h(ImageController.changeImageStatus))

export { ImageRouter }