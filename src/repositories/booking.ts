import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Instructor } from '../entities/Instructors'
import { InstructorController } from '../controllers/instructor'
import { InstructorSchema } from '../interfaces/instructor'
import { Booking } from '../entities/Bookings'

export const BookingRepository = {

    async deleteBooking(bookingId: number) {
        const bookingRepository = getRepository(Booking)

        const booking = await getRepository(Booking).findOne({
            where: {
                id: bookingId
            }
        })
        if (!booking) throw new ErrorResponse(404, 14, 'La reservacion no existe')


        await bookingRepository.remove(booking)

    }
}