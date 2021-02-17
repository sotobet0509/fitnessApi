import { MeRepository } from './me';
import { getRepository, getConnection, Repository, createQueryBuilder } from 'typeorm'
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
            relations: ['Booking', 'Booking.Seat', 'Booking.Seat.Room', 'Booking.User', "Booking.User.User_categories", "Booking.User.User_categories.Categories"]
        })
        if (schedule.length == 0) throw new ErrorResponse(404, 13, 'El horario no existe o esta vacio')

        for (var i in schedule) {
            for (var j in schedule[i].Booking) {
                delete schedule[i].Booking[j].User.email
                delete schedule[i].Booking[j].User.createdAt
                delete schedule[i].Booking[j].User.facebookId
                delete schedule[i].Booking[j].User.googleId
                delete schedule[i].Booking[j].User.password
                delete schedule[i].Booking[j].User.isAdmin
                delete schedule[i].Booking[j].User.isDeleted
                delete schedule[i].Booking[j].User.tempToken
            }
        }

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

        //const repository = getRepository(Purchase)

        let purchases = await createQueryBuilder(Purchase)
            .leftJoinAndSelect('Purchase.Bundle', 'Bundle')
            //.leftJoinAndSelect('Purchase.Payment_method', 'Payment_method')
            //.leftJoinAndSelect('Purchase.Transaction', 'Transaction')
            .where('Bundle.isGroup=:isGroup', { isGroup: false })
            .andWhere('Purchase.users_id=:userId', { userId: client.id })
            .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
            .getMany()

        /*const purchases = await repository.find({
            where: {
                User: client,
                isCanceled: false
            },
            relations: ['Bundle', 'Payment_method', "Transaction"]
        })*/

        //nuevo flujo
        const bookingRepository = getRepository(Booking)

        // const bookings = await getRepository(Booking).find({
        //     where: {
        //         User: client
        //     }
        // })

        // let bookings = await createQueryBuilder(User)
        // .leftJoinAndSelect('User.Booking', 'Booking')
        // .leftJoinAndSelect('Booking.fromPurchase', 'Purchase')
        // .leftJoinAndSelect('Purchase.Bundle', 'Bundle')
        // //.where('User.id=:userId', { userId: client.id })
        // .andWhere('Bundle.isGroup=:isGroup', { isGroup: false })
        // .getOne()

        let boookingsArrayTotal: Booking[] = []
        for (const i in purchases) {
            let bookingsPurchases = await getRepository(Booking).find({
                where:
                {
                    fromPurchase: purchases[i].id
                }
            })
            for (const j in bookingsPurchases) {
                boookingsArrayTotal.push(bookingsPurchases[j])
            }
        }

        let classes: pendingClasses[]
        classes = await getPendingClasses(purchases, boookingsArrayTotal)


        classes = classes.filter((p: pendingClasses) => {
            let expirationDay = moment(p.purchase.expirationDate)
            if (expirationDay.isBefore(moment())) return false
            if (p.pendingClasses === 0 && p.pendingPasses === 0) return false
            return true
        })

        let pending = 0
        let pendingPasses = 0

        let p = await MeRepository.getClasses(client)
        pending = p.pending
        pendingPasses = p.pendingPasses

        if (!scheduleExist.isPrivate) {
            if (pending <= 0 && !isPass) throw new ErrorResponse(409, 16, 'No quedan clases disponibles')

            if (pendingPasses <= 0 && isPass) throw new ErrorResponse(409, 17, 'No quedan pases disponibles')
        }

        const schedule = await bookingRepository.findOne({
            where: {
                Schedule: scheduleExist,
                Seat: seat
            }
        })
        if (schedule) throw new ErrorResponse(409, 16, 'Horario no disponible')

        let idPurchase = null
        const currentDate = moment(scheduleExist.date)

        if (!isPass) {
            for (var i in classes) {
                if (classes[i].pendingClasses != 0) {
                    if (currentDate.isSameOrBefore(moment(classes[i].purchase.expirationDate))) {
                        idPurchase = classes[i].purchase.id
                        break
                    }
                }
            }
        } else {
            for (var i in classes) {
                if (classes[i].pendingPasses != 0) {
                    if (currentDate.isSameOrBefore(moment(classes[i].purchase.expirationDate))) {
                        idPurchase = classes[i].purchase.id
                        break
                    }
                }
            }
        }

        if (idPurchase === null) throw new ErrorResponse(409, 49, 'La fecha seleccionada es después de la fecha de expiración de sus paquetes')

        const booking = new Booking()
        if (scheduleExist.isPrivate) {
            let privatePurchase = await createQueryBuilder(Purchase)
                .leftJoinAndSelect('Purchase.Bundle', 'Bundle')
                .where('Bundle.classNumber=:classNumber', { classNumber: 0 })
                .andWhere('Purchase.addedClasses=:addedClasses', { addedClasses: 0 })
                .andWhere('Purchase.users_id=:userId', { userId: client.id })
                .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
                .getOne()

            if (!privatePurchase) throw new ErrorResponse(409, 49, 'El usuario no puede reservar esta clase')

            privatePurchase.addedClasses += 1
            await getRepository(Purchase).save(privatePurchase)

            booking.Schedule = scheduleExist
            booking.Seat = seat
            booking.User = client
            booking.isPass = isPass
            booking.fromPurchase = privatePurchase
        } else {
            booking.Schedule = scheduleExist
            booking.Seat = seat
            booking.User = client
            booking.isPass = isPass
            booking.fromPurchase = idPurchase
        }


        // const currentPurchase = await getRepository(Purchase).findOne({
        //     where: {
        //         id: idPurchase
        //     }
        // })

        await bookingRepository.save(booking)

        return isPass ? pendingPasses - 1 : pendingPasses

    },

    async setBookingGroupByAdmin(scheduleId: number, seatId: number, clientId: string, isPass: boolean) {
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

        const client = await getRepository(User).findOne({
            where: {
                id: clientId
            }
        })

        if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')
        if (!client.isLeader) {
            if (!client.fromGroup) throw new ErrorResponse(404, 14, 'El cliente no pertenece a ningún grupo')
        }

        let mainUser

        if (client.fromGroup) {
            mainUser = client.fromGroup
        } else {
            mainUser = client.id
        }

        const liderPurchases = await createQueryBuilder(User)
            .innerJoinAndSelect('User.Purchase', 'Purchase')
            .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
            .where('Bundle.isGroup=:isGroup', { isGroup: true })
            .andWhere('Purchase.users_id=:idUser', { idUser: mainUser })
            .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
            .getOne();

        let boookingsArrayTotal: Booking[] = []
        for (const i in liderPurchases.Purchase) {
            let bookingsPurchases = await getRepository(Booking).find({
                where:
                {
                    fromPurchase: liderPurchases.Purchase[i].id
                }
            })
            for (const j in bookingsPurchases) {
                boookingsArrayTotal.push(bookingsPurchases[j])
            }
        }

        let classesGroup: pendingClasses[]
        classesGroup = await getPendingClasses(liderPurchases.Purchase, boookingsArrayTotal)

        classesGroup = classesGroup.filter((p: pendingClasses) => {
            let expirationDay = moment(p.purchase.expirationDate)
            if (expirationDay.isBefore(moment())) return false
            if (p.pendingClasses === 0 && p.pendingPasses === 0) return false
            return true
        })

        let pendingGroupC = 0
        let pendingGroupP = 0

        let p = await MeRepository.getClasses(client)
        pendingGroupC = p.pendingGroup
        pendingGroupP = p.pendingPassesGroup

        if (pendingGroupC <= 0 && !isPass) throw new ErrorResponse(409, 16, 'No quedan clases disponibles')

        //if (pendingGroupP <= 0 && isPass) throw new ErrorResponse(409, 17, 'No quedan pases disponibles')

        const schedule = await getRepository(Booking).findOne({
            where: {
                Schedule: scheduleExist,
                Seat: seat
            }
        })
        if (schedule) throw new ErrorResponse(409, 16, 'Horario no disponible')

        let idPurchase = null
        const currentDate = moment(scheduleExist.date)

        if (!isPass) {
            for (var i in classesGroup) {
                if (classesGroup[i].pendingClasses != 0) {
                    if (currentDate.isSameOrBefore(moment(classesGroup[i].purchase.expirationDate))) {
                        //console.log(currentDate, moment(classesGroup[i].purchase.expirationDate))
                        idPurchase = classesGroup[i].purchase.id
                        break
                    }
                }
            }
        } else {
            for (var i in classesGroup) {
                if (classesGroup[i].pendingPasses != 0) {
                    if (currentDate.isSameOrBefore(moment(classesGroup[i].purchase.expirationDate))) {
                        //console.log(currentDate, moment(classesGroup[i].purchase.expirationDate))
                        idPurchase = classesGroup[i].purchase.id
                        break
                    }
                }
            }
        }

        if (idPurchase === null) throw new ErrorResponse(409, 49, 'La fecha seleccionada es después de la fecha de expiración de sus paquetes')

        const booking = new Booking()
        booking.Schedule = scheduleExist
        booking.Seat = seat
        booking.User = client
        booking.isPass = isPass
        booking.fromPurchase = idPurchase

        const bookingRepository = getRepository(Booking)
        await bookingRepository.save(booking)

        return isPass ? pendingGroupP - 1 : pendingGroupP
    },

    async setBookingGroup(scheduleId: number, seatId: number, clientId: string, isPass: boolean, user: User) {
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

        if (user.isLeader) {

            const client = await getRepository(User).findOne({
                where: {
                    id: clientId
                }
            })

            if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')
            //if (client.fromGroup != user.id) throw new ErrorResponse(404, 14, 'El cliente no pertenece al grupo')

            const liderPurchases = await createQueryBuilder(User)
                .innerJoinAndSelect('User.Purchase', 'Purchase')
                .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
                .where('Bundle.isGroup=:isGroup', { isGroup: true })
                .andWhere('Purchase.users_id=:idUser', { idUser: user.id })
                .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
                .getOne();

            let boookingsArrayTotal: Booking[] = []
            for (const i in liderPurchases.Purchase) {
                let bookingsPurchases = await getRepository(Booking).find({
                    where:
                    {
                        fromPurchase: liderPurchases.Purchase[i].id
                    }
                })
                for (const j in bookingsPurchases) {
                    boookingsArrayTotal.push(bookingsPurchases[j])
                }
            }

            let classesGroup: pendingClasses[]
            classesGroup = await getPendingClasses(liderPurchases.Purchase, boookingsArrayTotal)

            classesGroup = classesGroup.filter((p: pendingClasses) => {
                let expirationDay = moment(p.purchase.expirationDate)
                if (expirationDay.isBefore(moment())) return false
                if (p.pendingClasses === 0 && p.pendingPasses === 0) return false
                return true
            })

            let pendingGroupC = 0
            let pendingGroupP = 0

            let p = await MeRepository.getClasses(client)
            pendingGroupC = p.pendingGroup
            pendingGroupP = p.pendingPassesGroup

            if (pendingGroupC <= 0 && !isPass) throw new ErrorResponse(409, 16, 'No quedan clases disponibles')

            //if (pendingGroupP <= 0 && isPass) throw new ErrorResponse(409, 17, 'No quedan pases disponibles')

            const schedule = await getRepository(Booking).findOne({
                where: {
                    Schedule: scheduleExist,
                    Seat: seat
                }
            })
            if (schedule) throw new ErrorResponse(409, 16, 'Horario no disponible')

            let idPurchase = null
            const currentDate = moment(scheduleExist.date)

            if (!isPass) {
                for (var i in classesGroup) {
                    if (classesGroup[i].pendingClasses != 0) {
                        if (currentDate.isSameOrBefore(moment(classesGroup[i].purchase.expirationDate))) {
                            //console.log(currentDate, moment(classesGroup[i].purchase.expirationDate))
                            idPurchase = classesGroup[i].purchase.id
                            break
                        }
                    }
                }
            } else {
                for (var i in classesGroup) {
                    if (classesGroup[i].pendingPasses != 0) {
                        if (currentDate.isSameOrBefore(moment(classesGroup[i].purchase.expirationDate))) {
                            //console.log(currentDate, moment(classesGroup[i].purchase.expirationDate))
                            idPurchase = classesGroup[i].purchase.id
                            break
                        }
                    }
                }
            }

            if (idPurchase === null) throw new ErrorResponse(409, 49, 'La fecha seleccionada es después de la fecha de expiración de sus paquetes')

            const booking = new Booking()
            booking.Schedule = scheduleExist
            booking.Seat = seat
            booking.User = client
            booking.isPass = isPass
            booking.fromPurchase = idPurchase

            const bookingRepository = getRepository(Booking)
            await bookingRepository.save(booking)

            return isPass ? pendingGroupP - 1 : pendingGroupP

        } else {

            if (!user.fromGroup) throw new ErrorResponse(404, 14, 'El cliente no pertenece a ningún grupo')
            const liderPurchases = await createQueryBuilder(User)
                .innerJoinAndSelect('User.Purchase', 'Purchase')
                .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
                .where('Bundle.isGroup=:isGroup', { isGroup: true })
                .andWhere('Purchase.users_id=:idUser', { idUser: user.fromGroup })
                .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
                .getOne();

            let boookingsArrayTotal: Booking[] = []
            for (const i in liderPurchases.Purchase) {
                let bookingsPurchases = await getRepository(Booking).find({
                    where:
                    {
                        fromPurchase: liderPurchases.Purchase[i].id
                    }
                })
                for (const j in bookingsPurchases) {
                    boookingsArrayTotal.push(bookingsPurchases[j])
                }
            }

            let classesGroup: pendingClasses[]
            classesGroup = await getPendingClasses(liderPurchases.Purchase, boookingsArrayTotal)

            classesGroup = classesGroup.filter((p: pendingClasses) => {
                let expirationDay = moment(p.purchase.expirationDate)
                if (expirationDay.isBefore(moment())) return false
                if (p.pendingClasses === 0 && p.pendingPasses === 0) return false
                return true
            })

            let pendingGroupC = 0
            let pendingGroupP = 0
            for (var i in classesGroup) {
                pendingGroupC += classesGroup[i].pendingClasses
                pendingGroupP += classesGroup[i].pendingPasses
            }

            if (pendingGroupC <= 0 && !isPass) throw new ErrorResponse(409, 16, 'No quedan clases disponibles')

            //if (pendingGroupP <= 0 && isPass) throw new ErrorResponse(409, 17, 'No quedan pases disponibles')

            const schedule = await getRepository(Booking).findOne({
                where: {
                    Schedule: scheduleExist,
                    Seat: seat
                }
            })
            if (schedule) throw new ErrorResponse(409, 16, 'Horario no disponible')

            let idPurchase = null
            const currentDate = moment(scheduleExist.date)

            if (!isPass) {
                for (var i in classesGroup) {
                    if (classesGroup[i].pendingClasses != 0) {
                        if (currentDate.isSameOrBefore(moment(classesGroup[i].purchase.expirationDate))) {
                            //console.log(currentDate, moment(classesGroup[i].purchase.expirationDate))
                            idPurchase = classesGroup[i].purchase.id
                            break
                        }
                    }
                }
            } else {
                for (var i in classesGroup) {
                    if (classesGroup[i].pendingPasses != 0) {
                        if (currentDate.isSameOrBefore(moment(classesGroup[i].purchase.expirationDate))) {
                            //console.log(currentDate, moment(classesGroup[i].purchase.expirationDate))
                            idPurchase = classesGroup[i].purchase.id
                            break
                        }
                    }
                }
            }

            if (idPurchase === null) throw new ErrorResponse(409, 49, 'La fecha seleccionada es después de la fecha de expiración de sus paquetes')

            const booking = new Booking()
            booking.Schedule = scheduleExist
            booking.Seat = seat
            booking.User = user
            booking.isPass = isPass
            booking.fromPurchase = idPurchase

            const bookingRepository = getRepository(Booking)
            await bookingRepository.save(booking)

            return isPass ? pendingGroupP - 1 : pendingGroupP

        }
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
        if (data.theme) {
            schedule.theme = data.theme
        }
        if (data.isPrivate) {
            schedule.isPrivate = data.isPrivate
        }
        //console.log(schedule.theme)
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
        updateSchedule.theme = room ? data.theme : updateSchedule.theme
        updateSchedule.isPrivate = room ? data.isPrivate : updateSchedule.isPrivate
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
            //await sendDeleteBooking(booking[i].User.email)
            await bookingRepository.remove(booking[i])
        }

        await scheduleRepository.remove(schedule)
    },

    async setAssistance(bookingId: number) {
        let booking = await getRepository(Booking).findOne({
            where: {
                id: bookingId
            }
        })

        booking.assistance = !booking.assistance

        await getRepository(Booking).save(booking)
    }
}