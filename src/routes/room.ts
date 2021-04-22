import { Router } from 'express'
import * as h from 'express-async-handler'
import { RoomController } from '../controllers/room'

const RoomRouter = Router({ mergeParams: true })

RoomRouter.get('/', h(RoomController.getAllRooms))


export { RoomRouter }