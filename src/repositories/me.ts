import { getRepository, getConnection, Repository } from 'typeorm'
import { User } from '../entities/Users'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Purchase } from '../entities/Purchases'
import { Booking } from '../entities/Bookings'
import { getPendingClasses, orderByExpirationDay } from "../utils/index"
import { pendingClasses } from '../interfaces/purchase'
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
        const bookings = await getRepository(Booking).find({
            where: {
                User: profile
            },
            relations: ['Schedule', 'Schedule.Instructor']
        })
        let minutesDone = 0
        let favorites = []
        console.log(bookings, profile)
        for (var i in bookings) {
            const booking: Booking = bookings[i]
            const schedule = booking.Schedule
            const start = moment(schedule.date).set({
                hour: new Date(`2020-01-01 ${schedule.start}`).getHours(),
                minutes: new Date(`2020-01-01 ${schedule.start}`).getMinutes(),
                seconds: 0
            })
            const end = moment(schedule.date).set({
                hour: new Date(`2020-01-01 ${schedule.end}`).getHours(),
                minutes: new Date(`2020-01-01 ${schedule.end}`).getMinutes(),
                seconds: 0
            })
            console.log('start', start)
            console.log('end', end)
            const minutes = moment.duration(end.diff(start))
            if (start.isBefore(moment()) && moment(schedule.date).month() === moment().month()) {
                console.log('done', minutes.asMinutes())
                minutesDone += minutes.asMinutes()
            }
            const instructor = schedule.Instructor
            let added = false
            for (var j in favorites) {
                const fav = favorites[j]
                if (instructor.name === fav[0]) {
                    added = true
                    favorites[j][1] = favorites[j][1] + 1
                    break
                }
            }
            if (!added) {
                favorites.push([instructor.name, 1])
            }
        }
        let sFav = ""
        let sFavNum = 0
        for (var i in favorites) {
            const fav = favorites[i]
            if (fav[1] > sFavNum) {
                sFavNum = fav[1]
                sFav = fav[0]
            }
        }
        delete profile.password
        return {
            profile,
            minutesDone,
            favorite: sFav
        }
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

        const bookingsNoPasses = await getRepository(Booking).find({
            where: {
                User: user,
                isPass: false
            }
        })

        const passes = await repository.find({
            where: {
                User: user,
                isPass: true
            },
            relations: ['Schedule', 'Seat', 'Schedule.Instructor', 'Seat.Room', 'Seat.Room.Location']
        })

        let classes: pendingClasses[]
        classes = getPendingClasses(purchases,bookings)
        
        classes = classes.filter((p: pendingClasses) => {
            let expirationDay = moment(p.purchase.date).add(p.purchase.Bundle.expirationDays, "days")
            if (expirationDay.isBefore(moment())) return false
            if (p.pendingClasses === 0 && p.pendingPasses === 0) return false
            return true
        })

        let pendingC = 0
        let pendingP = 0
        for( var i in classes){
            pendingC += classes[i].pendingClasses
            pendingP += classes[i].pendingPasses
        }
        
        return {
            bookings,
            taken: bookingsNoPasses.length,
            pending: pendingC,
            pendingPasses: pendingP,
            takenPasses: passes.length,
            compras: orderByExpirationDay( purchases)
        }
    },

    async uploadProfilePicture(url: string, user: User){
        const userRepository = getRepository(User)
        user.pictureUrl = url
        await userRepository.save(user)
    }
}