import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Instructor } from '../entities/Instructors'
import { InstructorController } from '../controllers/instructor'
import { InstructorSchema } from '../interfaces/instructor'
import { Booking } from '../entities/Bookings'

import * as moment from 'moment'
import { Schedule } from '../entities/Schedules'

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
            hour: new Date("2020-01-01 " + booking.Schedule.start).getHours(),
            minutes: new Date("2020-01-01 " + booking.Schedule.start).getMinutes(),
            seconds: 0
        })
        const duration = moment.duration(start.diff(moment())).asHours() + 5
        console.log(duration, start)
        if (duration >= 8) {
            await bookingRepository.remove(booking)
        } else {
            throw new ErrorResponse(409, 18, 'La reservacion ya no se puede eliminar')
        }

    },

    async getSeats(scheduleId: number) {
        const schedule = await getRepository(Schedule).findOne({
            where: {
                id: scheduleId
            }
        })
        if (!schedule) throw new ErrorResponse(404, 20, 'El horario no existe')

        const bookings = await getRepository(Booking).find({
            where: {
                Schedule: schedule
            },
            relations: ['Seat', 'User']
        })

        let data = []
        for (var i in bookings) {
            const booking = bookings[i]
            data.push({
                id: booking.id,
                name: booking.User.name,
                lastname: booking.User.lastname,
                seat: booking.Seat.number,
                date: schedule.date,
                start: schedule.start,
                end: schedule.end,
                isPass: booking.isPass
            })
        }

        return data

    }
}