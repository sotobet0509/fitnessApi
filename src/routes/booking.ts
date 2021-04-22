import { Router } from 'express'
import * as h from 'express-async-handler'
import { BookingController } from '../controllers/booking'
import {checkToken} from '../middleware/CheckToken'


const BookingRouter = Router({ mergeParams: true })

BookingRouter.get('/list/:schedule_id', h(checkToken), h(BookingController.getSeats))

BookingRouter.get('/search/:clientId/:query', h(checkToken), h(BookingController.searchBooking))

BookingRouter.get('/client/:clientId', h(checkToken), h(BookingController.getClientBookings))

BookingRouter.delete('/:booking_id',h(checkToken), h(BookingController.deleteBooking))

BookingRouter.delete('/admin/:booking_id', h(checkToken), h(BookingController.deleteBookingFromAdmin))

export { BookingRouter }