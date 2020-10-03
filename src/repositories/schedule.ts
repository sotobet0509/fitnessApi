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

    async setBooking(scheduleId: number, seatId: number, clientId: string) {
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
            },
            relations: ['Bundle', 'Payment_method']
        })
        let clases = 0
        purchases.forEach(purchase => {
            const bundle = purchase.Bundle
            const buyedAt = moment(purchase.date)
            // no se añaden clases de paquetes expirados
            if (moment().diff(buyedAt, 'days') <= bundle.expirationDays) {
                console.log('clases añadidas', bundle.classNumber)
                clases = clases + bundle.classNumber
            }
        })
        const bookingRepository = getRepository(Booking)
        const bookings = await bookingRepository.find({
            where: {
                User: client
            }
        })
        let clasesTomadas = bookings.length
        console.log('clases tomadas', clasesTomadas)

        let pending = clases - clasesTomadas
        console.log('clases pendientes', pending)
        if (pending <= 0) throw new ErrorResponse(409, 16, 'No quedan clases disponibles')

        const schedule = await bookingRepository.findOne({
            where: {
                Schedule: scheduleExist,
                Seat: seat
            }
        })
        if (schedule) throw new ErrorResponse(409, 16, 'Horario no disponible')




        const booking = new Booking()
        booking.Schedule = scheduleExist
        booking.Seat = seat
        booking.User = client

        await bookingRepository.save(booking)

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


        let schedule = new Schedule()
        schedule.date = data.date
        schedule.end = new Date(data.end)
        schedule.start = new Date(data.start)
        schedule.Instructor = instructor
        schedule.Rooms = room

       

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
        let instructor = new Instructor()
        instructor.id = data.instructor_id
        let room = new Room()
        room.id= data.roomsId

        updateSchedule.date = data.date ? data.date: updateSchedule.date
        updateSchedule.end = data.end ? data.end: updateSchedule.end
        updateSchedule.start = data.start ? data.start:  updateSchedule.start
        updateSchedule.Instructor = instructor ? instructor : updateSchedule.Instructor
        updateSchedule.Rooms = room ? room: updateSchedule.Rooms
        
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
                Schedule: scheduleId
            }
        })

        for(var i in booking) {         
            await bookingRepository.remove(booking[i])
        }
        
        await scheduleRepository.remove(schedule)
    }
}