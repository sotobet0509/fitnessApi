import { getRepository, getConnection, Repository } from 'typeorm'
import { User } from '../entities/Users'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Purchase } from '../entities/Purchases'
import { Booking } from '../entities/Bookings'

import * as moment from 'moment'

export const MeRepository = {
    async getProfile(id: string) {
        const repository = getRepository(User)
        const profile = await repository.findOne({
            where: {
                id: id
            }
        })
        if (!profile) throw new ErrorResponse(404, 10, 'El usuario no existe')
        delete profile.password
        return profile
    },

    async getHistory(user: User) {
        const repository = getRepository(Purchase)
        const purchases = await repository.find({
            where: {
                User: user
            },
            relations: ['Bundle', 'Payment_method']
        })
        let clases = 0
        purchases.forEach(purchase => {
            const bundle = purchase.Bundle
            const buyedAt = moment(purchase.date)
            // no se añaden clases de paquetes expirados
            if (moment().diff(buyedAt, 'days') <= bundle.expirationDays) {
                clases += purchase.Bundle.classNumber
            }
        })
        const bookingRepository = getRepository(Booking)
        const bookings = await bookingRepository.find({
            where: {
                User: user
            }
        })
        let clasesTomadas = bookings.length
        return {
            purchases,
            taken: clasesTomadas,
            pending: clases - clasesTomadas >= 0 ? clases - clasesTomadas : 0
        }
    },
    async getClasses(user: User) {
        const repository = getRepository(Booking)
        const bookings = await repository.find({
            where: {
                User: user
            },
            relations: ['Schedule', 'Seat', 'Schedule.Instructor', 'Seat.Room', 'Seat.Room.Location']
        })
        const purchases = await getRepository(Purchase).find({
            where: {
                User: user
            },
            relations: ['Bundle', 'Payment_method']
        })
        let clases = 0
        let passes = 0
        purchases.forEach(purchase => {
            clases += purchase.Bundle.classNumber
            passes += purchase.Bundle.passes
        })

        let takenClases = 0
        let takenPasses = 0
        for (var i in bookings) {
            const booking = bookings[i]
            if (booking.isPass) {
                takenPasses += 1
            } else {
                takenClases += 1
            }
        }


        let clasesPendientes = clases - takenClases
        let pasesPendientes= passes - takenPasses
        return {
            bookings,
            taken: takenClases,
            pending: clasesPendientes,
            pendingPasses: pasesPendientes,
            takenPasses
        }

    }
}