import { Router } from 'express'
import * as h from 'express-async-handler'
import { BookingController } from '../controllers/booking'
import {checkToken} from '../middleware/CheckToken'


const BookingRouter = Router({ mergeParams: true })

BookingRouter.delete('/:booking_id',h(checkToken), h(BookingController.deleteBooking))

export { BookingRouter }