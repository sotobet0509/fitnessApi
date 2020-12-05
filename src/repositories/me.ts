import { getRepository, getConnection, Repository } from 'typeorm'
import { User } from '../entities/Users'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Purchase } from '../entities/Purchases'
import { Booking } from '../entities/Bookings'
import { getPendingClasses, orderByExpirationDay } from "../utils/index"
import { pendingClasses } from '../interfaces/purchase'
import * as moment from 'moment'
import { Folios } from '../entities/Folios'
import { Alternate_users } from '../entities/alternateUsers'
import { ClientData } from '../interfaces/auth'
import { PasswordService } from '../services/password'
import { Categories } from '../entities/categories'
import { User_items } from '../entities/User_items'
import { User_categories } from '../entities/UserCategories'
import { EditItems } from '../interfaces/items'

export const MeRepository = {
    async getProfile(id: string) {
        const repository = getRepository(User)
        const profile = await repository.findOne({
            where: {
                id: id
            },
            relations: ["User_categories","User_categories.Categories", "User_categories.Categories.User_items" ]
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
        //console.log(bookings, profile)
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
            //console.log('start', start)
            //console.log('end', end)
            const minutes = moment.duration(end.diff(start))
            if (start.isBefore(moment()) && moment(schedule.date).month() === moment().month()) {
                //console.log('done', minutes.asMinutes())
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
            relations: ['Bundle', 'Payment_method', 'Transaction']
        })
        let clases = 0


        for (var i in purchases) {
            const bundle = purchases[i].Bundle
            const buyedAt = moment(purchases[i].date)
            // no se añaden clases de paquetes expirados
            if (moment().diff(buyedAt, 'days') <= bundle.expirationDays) {
                clases += purchases[i].Bundle.classNumber
            }
            let folio = await getRepository(Folios).findOne({
                where: {
                    purchase: purchases[i].id
                },
                relations: ["Alternate_users"]
            })
            purchases[i]['folio'] = folio

        }

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
            relations: ['Bundle', 'Payment_method', 'Transaction']
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
        classes = await getPendingClasses(purchases, bookings)

        classes = classes.filter((p: pendingClasses) => {
            let expirationDay = moment(p.purchase.expirationDate)
            if (expirationDay.isBefore(moment())) return false
            if (p.pendingClasses === 0 && p.pendingPasses === 0) return false
            return true
        })

        let pendingC = 0
        let pendingP = 0
        for (var i in classes) {
            pendingC += classes[i].pendingClasses
            pendingP += classes[i].pendingPasses
        }
        let isUnlimited = false
        for (var i in classes) {
            if (classes[i].purchase.Bundle.isUnlimited) {
                isUnlimited = true
                break
            }
        }

        let nextExpirationDate: Date
        if (classes.length == 0) {
            nextExpirationDate = null
        } else {
            nextExpirationDate = classes[classes.length - 1].purchase.expirationDate
        }
        return {
            bookings,
            taken: bookingsNoPasses.length,
            pending: pendingC,
            pendingPasses: pendingP,
            takenPasses: passes.length,
            compras: orderByExpirationDay(purchases),
            isUnlimited,
            nextExpirationDate
        }
    },

    async uploadProfilePicture(url: string, user: User) {
        const userRepository = getRepository(User)
        user.pictureUrl = url
        await userRepository.save(user)
    },

    async updateUserData(userdata: User, data: ClientData) {
        const updateUser = userdata
        if (data.password) {
            const passwordService = new PasswordService(data.password)
            const password = await passwordService.getHashedPassword()
            updateUser.password = data.password ? password : updateUser.password
        }
        updateUser.name = data.name ? data.name : updateUser.name
        updateUser.email = data.email ? data.email : updateUser.email
        updateUser.lastname = data.lastname ? data.lastname : updateUser.lastname


        await getRepository(User).save(updateUser)
    },

    async getItems(userdata: User) {

        const items = await getRepository(User_categories).find({
            where: {
                User: userdata
            },
            relations: ["Categories"]
        })
        return items
    },

    async getItemCategories(itemId: number) {
        const categories = await getRepository(Categories).find({
            where: {
                User_items: itemId
            }
        })

        return categories
    },

    async getAllItems() {
        const items = await getRepository(User_items).find({
         relations:["Categories"]
        })
        return items
    },

    async editItems(data: EditItems, userdata: User){
        const deleteItems = await getRepository(User_categories).find({
            where: {
                User: userdata
            }
        })

        for(var i in deleteItems){
            await getRepository(User_categories).delete(deleteItems[i])
        }
        
      
        for (var j in data.categories){
            let newUserCategory = new User_categories
            const newCategory = await getRepository(Categories).findOne({
                where:{
                    id: data.categories[j]
                }
            })
            console.log(data.categories[j])

            newUserCategory.User = userdata
            newUserCategory.Categories = newCategory
            await getRepository(User_categories).save(newUserCategory)
        }
    }
}