import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Schedule } from '../entities/Schedules'
import { Booking } from '../entities/Bookings'
import { User } from '../entities/Users'
import { Purchase } from '../entities/Purchases'
import { Seat } from '../entities/Seats'

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
        if(!scheduleExist) throw new ErrorResponse(404, 16, 'Horario no existe')
        
        const seat = await getRepository(Seat).findOne({
            where: {
                id: seatId
            }
        })
        if(!seat) throw new ErrorResponse(404, 16, 'El asiento no existe')

        const repository = getRepository(Purchase)
        const purchases = await repository.find({
            where: {
                User: clientId,
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
                clases += bundle.classNumber
            }
        })
        const bookingRepository = getRepository(Booking)
        const bookings = await bookingRepository.find({
            where: {
                User: clientId
            }
        })
        let clasesTomadas = bookings.length

        let pending = (clases - clasesTomadas) >= 0 ? (clases - clasesTomadas) : 0
        if(pending == 0) throw new ErrorResponse(409, 16, 'No quedan clases disponibles')

        const schedule = await bookingRepository.findOne({
            where: {
                Schedule: scheduleExist
            }
        })
        if(schedule) throw new ErrorResponse(409, 16, 'Horario no disponible')

        


        const booking = new Booking()
        booking.Schedule = scheduleExist
        booking.Seat = seat
        booking.User = client

        await bookingRepository.save(booking)
        
        }

}