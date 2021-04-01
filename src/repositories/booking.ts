import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Instructor } from '../entities/Instructors'
import { InstructorController } from '../controllers/instructor'
import { InstructorSchema } from '../interfaces/instructor'
import { Booking } from '../entities/Bookings'

import * as moment from 'moment'
import { Schedule } from '../entities/Schedules'
import { Purchase } from '../entities/Purchases'
import { DeleteBooking } from '../interfaces/booking'

export const BookingRepository = {

    async deleteBooking(bookingId: number) {
        const bookingRepository = getRepository(Booking)

        const booking = await getRepository(Booking).findOne({
            where: {
                id: bookingId
            },
            relations: ['Schedule', 'fromPurchase']
        })
        if (!booking) throw new ErrorResponse(404, 14, 'La reservacion no existe')
        const start = moment(booking.Schedule.date).set({
            hour: new Date("2020-01-01 " + booking.Schedule.start).getHours(),
            minutes: new Date("2020-01-01 " + booking.Schedule.start).getMinutes(),
            seconds: 0
        })
        const duration = moment.duration(start.diff(moment())).asHours() + 6
        if (duration >= 3) {
            if (booking.Schedule.isPrivate) {
                let privatePurchase = await getRepository(Purchase).findOne({
                    where: {
                        id: booking.fromPurchase.id
                    }
                })
                privatePurchase.addedClasses -= 1
                await getRepository(Purchase).save(privatePurchase)
            }
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
            relations: ['Seat', 'User', 'User.User_categories', 'User.User_categories.Categories', 'User.User_categories.Categories.User_items']
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
                isPass: booking.isPass,
                items: booking.User,
                assistance: booking.assistance
            })
        }
        return data
    },

    async deleteBookingFromAdmin(bookingId: number, data: DeleteBooking) {

        const booking = await getRepository(Booking).findOne({
            where: {
                id: bookingId
            },
            relations: ['Schedule', 'fromPurchase']
        })
        if (!booking) throw new ErrorResponse(404, 14, 'La reservacion no existe')

        if (data.discountClass) {
            let purchase = await getRepository(Purchase).findOne({
                where: {
                    id: booking.fromPurchase.id
                }
            })
            if (!purchase) throw new ErrorResponse(404, 14, 'La compra no existe')

            purchase.addedClasses -= 1

            await getRepository(Purchase).save(purchase)
            await getRepository(Booking).remove(booking)
        }else{
            await getRepository(Booking).remove(booking)
        }
    },
}