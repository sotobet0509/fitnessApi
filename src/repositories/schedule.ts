import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Schedule } from '../entities/Schedules'
import { Booking } from '../entities/Bookings'
import { User } from '../entities/Users'
import { Purchase } from '../entities/Purchases'
import { Seat } from '../entities/Seats'
import { ScheduleSchema } from '../interfaces/schedule'
import { Instructor } from '../entities/Instructors'
import { Room } from '../entities/Rooms'

import * as moment from 'moment'
import { sendUpdateBooking, sendDeleteBooking } from '../services/mail'
import { pendingClasses } from '../interfaces/purchase'
import { getPendingClasses } from '../utils'

export const ScheduleRepository = {
    async getSchedule(scheduleId: number) {
        const schedule = await getRepository(Schedule).find({
            where: {
                id: scheduleId
            },
            relations: ['Booking', 'Booking.Seat']
        })
        if (schedule.length == 0) throw new ErrorResponse(404, 13, 'El horario no existe o esta vacio')

        return schedule
    },

    async setBooking(scheduleId: number, seatId: number, clientId: string, isPass: boolean) {
        const client = await getRepository(User).findOne(
            {
                where: {
                    id: clientId
                }
            }
        )
        if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')

        const scheduleExist = await getRepository(Schedule).findOne({
            where: {
                id: scheduleId
            }
        })
        if (!scheduleExist) throw new ErrorResponse(404, 16, 'Horario no existe')

        const seat = await getRepository(Seat).findOne({
            where: {
                id: seatId
            }
        })
        if (!seat) throw new ErrorResponse(404, 16, 'El asiento no existe')

        const repository = getRepository(Purchase)
        const purchases = await repository.find({
            where: {
                User: client,
                isCanceled: false
            },
            relations: ['Bundle', 'Payment_method',"Transaction"]
        })



        //nuevo flujo
        const bookingRepository = getRepository(Booking)
        const bookings = await getRepository(Booking).find({
            where: {
                User: client
            }
        })

        let classes: pendingClasses[]
        classes = await getPendingClasses(purchases, bookings)


        classes = classes.filter((p: pendingClasses) => {
            let expirationDay = moment(p.purchase.expirationDate)
            if (expirationDay.isBefore(moment())) return false
            if (p.pendingClasses === 0 && p.pendingPasses === 0) return false
            return true
        })

        let pending = 0
        let pendingPasses = 0

        for (var i in classes) {
            pending += classes[i].pendingClasses
            pendingPasses += classes[i].pendingPasses
        }



        if (pending <= 0 && !isPass) throw new ErrorResponse(409, 16, 'No quedan clases disponibles')

        if (pendingPasses <= 0 && isPass) throw new ErrorResponse(409, 17, 'No quedan pases disponibles')

        const schedule = await bookingRepository.findOne({
            where: {
                Schedule: scheduleExist,
                Seat: seat
            }
        })
        if (schedule) throw new ErrorResponse(409, 16, 'Horario no disponible')

        let idPurchase
        for (var i in classes) {
            if (classes[i].pendingClasses != 0) {
                idPurchase = classes[i].purchase.id
                break
            }
        }

        const booking = new Booking()
        booking.Schedule = scheduleExist
        booking.Seat = seat
        booking.User = client
        booking.isPass = isPass
        booking.fromPurchase = idPurchase

        await bookingRepository.save(booking)

        return isPass ? pendingPasses - 1 : pendingPasses

    },

    async createSchedule(data: ScheduleSchema) {
        const scheduleRepository = getRepository(Schedule)

        const instructor = await getRepository(Instructor).findOne(
            {
                where: {
                    id: data.instructor_id
                }
            }
        )
        if (!instructor) throw new ErrorResponse(404, 17, 'El instructor no existe')

        const room = await getRepository(Room).findOne(
            {
                where: {
                    id: data.roomsId
                }
            }
        )
        if (!room) throw new ErrorResponse(404, 18, 'La sala no existe')

        let tempStart = data.start.toString().substring(16, 24)
        const validateSchedule = await getRepository(Schedule).findOne(
            {
                where: {
                    date: data.date,
                    start: tempStart
                }
            }
        )
        if (validateSchedule) throw new ErrorResponse(404, 19, 'El horario ya esta ocupado')



        let schedule = new Schedule()
        schedule.date = data.date
        schedule.end = new Date(data.end)
        schedule.start = new Date(data.start)
        schedule.Instructor = instructor
        schedule.Rooms = room

        await scheduleRepository.save(schedule)

        return schedule
    },

    async updateSchedule(data: ScheduleSchema) {
        const scheduleRepository = getRepository(Schedule)

        const updateSchedule = await getRepository(Schedule).findOne({
            where: {
                id: data.id
            }
        })
        if (!updateSchedule) throw new ErrorResponse(404, 14, 'El horario no existe')

        const bookingRepository = getRepository(Booking)
        const booking = await getRepository(Booking).find({
            where: {
                Schedule: updateSchedule
            },
            relations: ['User']
        })

        if (data.deleteBookings) {
            for (var i in booking) {
                if (data.sendEmail) {
                    await sendUpdateBooking(booking[i].User.email)
                }
                await bookingRepository.remove(booking[i])
            }
        }

        let instructor = new Instructor()
        instructor.id = data.instructor_id
        let room = new Room()
        room.id = data.roomsId

        updateSchedule.date = data.date ? data.date : updateSchedule.date
        updateSchedule.end = data.end ? data.end : updateSchedule.end
        updateSchedule.start = data.start ? data.start : updateSchedule.start
        updateSchedule.Instructor = instructor ? instructor : updateSchedule.Instructor
        updateSchedule.Rooms = room ? room : updateSchedule.Rooms

        await scheduleRepository.save(updateSchedule)
    },

    async deleteSchedule(scheduleId: number) {
        const scheduleRepository = getRepository(Schedule)

        const schedule = await getRepository(Schedule).findOne({
            where: {
                id: scheduleId
            }
        })
        if (!schedule) throw new ErrorResponse(404, 14, 'El horario no existe')

        const bookingRepository = getRepository(Booking)

        const booking = await getRepository(Booking).find({
            where: {
                Schedule: schedule
            },
            relations: ['User']
        })

        for (var i in booking) {
            await sendDeleteBooking(booking[i].User.email)
            await bookingRepository.remove(booking[i])
        }

        await scheduleRepository.remove(schedule)
    }
}