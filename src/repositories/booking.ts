import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Instructor } from '../entities/Instructors'
import { InstructorController } from '../controllers/instructor'
import { InstructorSchema } from '../interfaces/instructor'
import { Booking } from '../entities/Bookings'

import * as moment from 'moment'

export const BookingRepository = {

    async deleteBooking(bookingId: number) {
        const bookingRepository = getRepository(Booking)

        const booking = await getRepository(Booking).findOne({
            where: {
                id: bookingId
            },
            relations: ['Schedule']
        })
        if (!booking) throw new ErrorResponse(404, 14, 'La reservacion no existe')

        const start = moment(booking.Schedule.date).set({
            hour: new Date(booking.Schedule.start).getHours(),
            minutes: new Date(booking.Schedule.start).getMinutes(),
            seconds: 0
        })
        const duration = moment.duration(moment().diff(start)).asHours()
        console.log(duration, start)
        if (duration >= 12) {
            await bookingRepository.remove(booking)
        } else {
            throw new ErrorResponse(409, 18, 'La reservacion ya no se puede eliminar')
        }

    }
}