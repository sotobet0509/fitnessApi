import { getRepository, getConnection, Repository } from 'typeorm'
import { User } from '../entities/Users'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Purchase } from '../entities/Purchases'
import { Booking } from '../entities/Bookings'

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
            clases += purchase.Bundle.classNumber
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
            pending: clases - clasesTomadas
        }
    },
    async getClasses(user: User){
        const repository = getRepository(Booking)
        const bookings = await repository.find({
            where: {
                User: user
            },
            relations: ['Schedule', 'Seat','Schedule.Instructor','Seat.Room','Seat.Room.Location']
        })
        const purchases = await getRepository(Purchase).find({
            where: {
                User: user
            },
            relations: ['Bundle', 'Payment_method']
        })
        let clases = 0
        purchases.forEach(purchase => {
            clases += purchase.Bundle.classNumber
        })

        let clasesTomadas = bookings.length
        return {
            bookings,
            taken: clasesTomadas,
            pending: clases - clasesTomadas
        }

    }
}