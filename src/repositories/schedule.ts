import { MeRepository } from './me';
import { getRepository, createQueryBuilder, Not, IsNull } from 'typeorm'
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
import { ClassesHistory } from '../entities/ClassesHistory';

export const ScheduleRepository = {

    async getSchedule(scheduleId: number) {

        let schedule = await createQueryBuilder(Schedule)
            .where('Schedule.id=:id', { id: scheduleId })
            .getOne()

        if (!schedule) throw new ErrorResponse(404, 13, 'El horario no existe o esta vacio')

        const bookings = await getRepository(Booking).find({
            where: {
                Schedule: schedule
            },
            relations: ["User", "Seat", "User.User_categories", "User.User_categories.Categories"]
        })

        for (var i in bookings) {
            delete bookings[i].User.password
            delete bookings[i].User.email
            delete bookings[i].User.facebookId
            delete bookings[i].User.googleId
            delete bookings[i].User.tempToken
            delete bookings[i].User.isAdmin
            delete bookings[i].User.isDeleted
            delete bookings[i].User.createdAt
            delete bookings[i].User.isLeader
            delete bookings[i].User.fromGroup
            delete bookings[i].User.groupName
            delete bookings[i].User.changed
        }

        let occupied = []
        for (var i in bookings) {
            occupied[i] = bookings[i].Seat.id
        }

        let seats = await getRepository(Seat).find()

        let filteredSeats = []
        if (occupied.length != 0) {

            let seat = await createQueryBuilder(Seat)
                .where('Seat.id NOT IN (:...seatId)', { seatId: occupied })
                .getMany()


            let freeSeats = []
            for (var i in seat) {
                freeSeats.push(seat[i].id)
            }

            for (var i in seats) {
                if (freeSeats.includes(seats[i].id)) {
                    filteredSeats.push({
                        ...seats[i],
                        available: true
                    })
                } else {
                    filteredSeats.push({
                        ...seats[i],
                        available: false
                    })
                }
            }
        } else {
            for (var i in seats) {
                filteredSeats.push({
                    ...seats[i],
                    available: false
                })
            }
        }

        return {
            ...schedule,
            Booking: bookings,
            available: filteredSeats
        }
    },


    async getClientSchedule(scheduleId: number, user: User) {

        const client = await getRepository(User).findOne({
            where: {
                id: user.id,
                isDeleted: false
            }
        })
        if (!client) throw new ErrorResponse(404, 13, 'Usuario no existe')

        let schedule = await createQueryBuilder(Schedule)
            .where('Schedule.id=:id', { id: scheduleId })
            .getOne()

        if (!schedule) throw new ErrorResponse(404, 13, 'El horario no existe o esta vacio')

        const bookings = await getRepository(Booking).find({
            where: {
                Schedule: schedule
            },
            relations: ["User", "Seat", "User.User_categories", "User.User_categories.Categories"]
        })

        for (var i in bookings) {
            delete bookings[i].User.password
            delete bookings[i].User.email
            delete bookings[i].User.facebookId
            delete bookings[i].User.googleId
            delete bookings[i].User.tempToken
            delete bookings[i].User.isAdmin
            delete bookings[i].User.isDeleted
            delete bookings[i].User.createdAt
            delete bookings[i].User.isLeader
            delete bookings[i].User.fromGroup
            delete bookings[i].User.groupName
            delete bookings[i].User.changed
        }

        let occupied = []
        for (var i in bookings) {
            occupied[i] = bookings[i].Seat.id
        }

        let seats = await getRepository(Seat).find()

        let filteredSeats = []
        if (occupied.length != 0) {

            let seat = await createQueryBuilder(Seat)
                .where('Seat.id NOT IN (:...seatId)', { seatId: occupied })
                .getMany()

            let freeSeats = []
            for (var i in seat) {
                freeSeats.push(seat[i].id)
            }

            for (var i in seats) {
                if (freeSeats.includes(seats[i].id)) {
                    filteredSeats.push({
                        ...seats[i],
                        available: true
                    })
                } else {
                    filteredSeats.push({
                        ...seats[i],
                        available: false
                    })
                }
            }
        } else {
            for (var i in seats) {
                filteredSeats.push({
                    ...seats[i],
                    available: false
                })
            }
        }

        return {
            ...schedule,
            available: filteredSeats
        }
    },

    async setBooking(scheduleId: number, seatId: number, clientId: string, isPass: boolean) {
        const client = await getRepository(User).findOne(
            {
                where: {
                    id: clientId,
                    isDeleted: false
                }
            }
        )
        if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')

        let classesHistory = await getRepository(ClassesHistory).findOne({
            where: {
                User: client
            }
        })

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


        let currentDate = moment().tz("America/Mexico_City")
        let pendingClasses = 0
        let pendingPasses = 0
        let purchaseId = null
        let purchasePosition = null

        if (scheduleExist.isPrivate) {
            const purchases = await createQueryBuilder(Purchase)
                .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
                .where('Purchase.expirationDate>=:cDate', { cDate: currentDate.format('YYYY-MM-DD') })
                .andWhere('Purchase.expirationDate<:scheduleDate', { cDate: moment(scheduleExist.date).format('YYYY-MM-DD') })
                .andWhere('(Purchase.status IN ("Completada") OR Purchase.status IS null)')
                .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
                .andWhere('Purchase.users_id=:userId', { userId: client.id })
                .andWhere('Bundle.isGroup=:isGroup', { isGroup: false })
                .andWhere('Bundle.isGroup=:isPrivate', { isPrivate: true })
                .orderBy('Purchase.expirationDate', 'ASC')
                .getMany();

            if (!purchases) throw new ErrorResponse(409, 17, 'El usuario no puede reservar en esta clase')

            for (var i in purchases) {
                if (moment(purchases[i].expirationDate).format('YYYY-MM-DD') >= moment(scheduleExist.date).format('YYYY-MM-DD')) {
                    pendingPasses += (purchases[i].Bundle.passes + purchases[i].addedPasses)
                    pendingClasses += (purchases[i].Bundle.classNumber + purchases[i].addedClasses)
                } else {
                    continue
                }
                if (isPass) {
                    if (pendingPasses == 0) {
                        purchaseId = purchases[i].id
                        purchasePosition = i
                        purchases[i].addedPasses -= 1
                        classesHistory.takenPasses++
                        break
                    }
                } else {
                    if (pendingClasses == 0) {
                        purchaseId = purchases[i].id
                        purchasePosition = i
                        purchases[i].addedClasses -= 1
                        classesHistory.takenClasses++
                        break
                    }
                }
            }

            if (isPass) {
                if (purchaseId === null) throw new ErrorResponse(409, 17, 'No quedan pases disponibles')
            } else {

                if (purchaseId === null) throw new ErrorResponse(409, 17, 'No quedan clases disponibles')
            }

            const schedule = await getRepository(Booking).findOne({
                where: {
                    Schedule: scheduleExist,
                    Seat: seat
                }
            })
            if (schedule) throw new ErrorResponse(409, 16, 'Horario no disponible')

            let booking = new Booking
            booking.Schedule = scheduleExist
            booking.Seat = seat
            booking.User = client
            booking.fromPurchase = purchaseId
            booking.isPass = isPass

            await getRepository(Booking).save(booking)
            await getRepository(Booking).save(purchases[purchasePosition])
            await getRepository(ClassesHistory).save(classesHistory)

        } else {

            const purchases = await createQueryBuilder(Purchase)
                .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
                .where('Date(Purchase.expirationDate) >=:cDate', { cDate: currentDate.format('YYYY-MM-DD') })
                .andWhere('(Purchase.status IN ("Completada") OR Purchase.status IS null)')
                .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
                .andWhere('Purchase.users_id=:userId', { userId: client.id })
                .andWhere('Bundle.isGroup=:isGroup', { isGroup: false })
                .andWhere('Bundle.isGroup=:isPrivate', { isPrivate: false })
                .orderBy('Purchase.expirationDate', 'ASC')
                .getMany();

            for (var i in purchases) {
                if (moment(purchases[i].expirationDate).format('YYYY-MM-DD') >= moment(scheduleExist.date).format('YYYY-MM-DD')) {
                    pendingPasses += (purchases[i].Bundle.passes + purchases[i].addedPasses)
                    pendingClasses += (purchases[i].Bundle.classNumber + purchases[i].addedClasses)
                } else {
                    continue
                }

                if (isPass) {
                    if (pendingPasses > 0) {
                        purchaseId = purchases[i].id
                        purchasePosition = i
                        purchases[i].addedPasses -= 1
                        classesHistory.takenPasses++
                        break
                    }
                } else {
                    if (pendingClasses > 0) {
                        purchaseId = purchases[i].id
                        purchasePosition = i
                        purchases[i].addedClasses -= 1
                        classesHistory.takenClasses++
                        break
                    }
                }
            }

            if (isPass) {
                if (purchaseId === null) throw new ErrorResponse(409, 17, 'No quedan pases disponibles')
            } else {

                if (purchaseId === null) throw new ErrorResponse(409, 17, 'No quedan clases disponibles')
            }

            const schedule = await getRepository(Booking).findOne({
                where: {
                    Schedule: scheduleExist,
                    Seat: seat
                }
            })
            if (schedule) throw new ErrorResponse(409, 16, 'Horario no disponible')

            let booking = new Booking
            booking.Schedule = scheduleExist
            booking.Seat = seat
            booking.User = client
            booking.fromPurchase = purchaseId
            booking.isPass = isPass

            await getRepository(Booking).save(booking)
            await getRepository(Purchase).save(purchases[purchasePosition])
            await getRepository(ClassesHistory).save(classesHistory)
        }
    },

    async setBookingGroupByAdmin(scheduleId: number, seatId: number, clientId: string, isPass: boolean) {

        const client = await getRepository(User).findOne(
            {
                where: {
                    id: clientId,
                    isDeleted: false
                }
            }
        )
        if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')

        let classesHistory = await getRepository(ClassesHistory).findOne({
            where: {
                User: client
            }
        })

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

        if (!client.isLeader) {
            if (!client.fromGroup) throw new ErrorResponse(404, 14, 'El cliente no pertenece a ningún grupo')
        }

        let mainUser

        if (client.fromGroup) {
            mainUser = client.fromGroup
        } else {
            mainUser = client.id
        }

        let currentDate = moment().tz("America/Mexico_City")
        let pendingClasses = 0
        let purchaseId = null
        let purchasePosition = null

        if (scheduleExist.isPrivate) {
            const purchases = await createQueryBuilder(Purchase)
                .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
                .where('Purchase.expirationDate>:cDate', { cDate: currentDate.format('YYYY-MM-DD') })
                .andWhere('Purchase.expirationDate<:scheduleDate', { cDate: moment(scheduleExist.date).format('YYYY-MM-DD') })
                .andWhere('(Purchase.status IN ("Completada") OR Purchase.status IS null)')
                .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
                .andWhere('Purchase.users_id=:userId', { userId: mainUser })
                .andWhere('Bundle.isGroup=:isGroup', { isGroup: true })
                .andWhere('Bundle.isGroup=:isPrivate', { isPrivate: true })
                .orderBy('Purchase.expirationDate', 'ASC')
                .getMany();

            if (!purchases) throw new ErrorResponse(409, 17, 'El usuario no puede reservar en esta clase')

            for (var i in purchases) {
                if (moment(purchases[i].date).format('YYYY-MM-DD') >= moment(scheduleExist.date).format('YYYY-MM-DD')) {

                    pendingClasses += (purchases[i].Bundle.classNumber + purchases[i].addedClasses)
                } else {
                    continue
                }

                if (pendingClasses == 0) {
                    purchaseId = purchases[i].id
                    purchasePosition = i
                    purchases[i].addedClasses -= 1
                    classesHistory.takenGroupClasses++
                    break
                }

            }

            if (purchaseId === null) throw new ErrorResponse(409, 17, 'No quedan clases disponibles')

            const schedule = await getRepository(Booking).findOne({
                where: {
                    Schedule: scheduleExist,
                    Seat: seat
                }
            })
            if (schedule) throw new ErrorResponse(409, 16, 'Horario no disponible')

            let booking = new Booking
            booking.Schedule = scheduleExist
            booking.Seat = seat
            booking.User = client
            booking.fromPurchase = purchaseId
            booking.isPass = isPass

            await getRepository(Booking).save(booking)
            await getRepository(Booking).save(purchases[purchasePosition])
            await getRepository(ClassesHistory).save(classesHistory)

        } else {

            const purchases = await createQueryBuilder(Purchase)
                .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
                .where('Date(Purchase.expirationDate) >:cDate', { cDate: currentDate.format('YYYY-MM-DD') })
                .andWhere('(Purchase.status IN ("Completada") OR Purchase.status IS null)')
                .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
                .andWhere('Purchase.users_id=:userId', { userId: mainUser })
                .andWhere('Bundle.isGroup=:isGroup', { isGroup: true })
                .andWhere('Bundle.isGroup=:isPrivate', { isPrivate: false })
                .orderBy('Purchase.expirationDate', 'ASC')
                .getMany();

            for (var i in purchases) {
                if (moment(purchases[i].date).format('YYYY-MM-DD') >= moment(scheduleExist.date).format('YYYY-MM-DD')) {
                    pendingClasses += (purchases[i].Bundle.classNumber + purchases[i].addedClasses)
                } else {
                    continue
                }


                if (pendingClasses > 0) {
                    purchaseId = purchases[i].id
                    purchasePosition = i
                    purchases[i].addedClasses -= 1
                    classesHistory.takenGroupClasses++
                    break
                }

            }

            if (purchaseId === null) throw new ErrorResponse(409, 17, 'No quedan clases disponibles')

            const schedule = await getRepository(Booking).findOne({
                where: {
                    Schedule: scheduleExist,
                    Seat: seat
                }
            })
            if (schedule) throw new ErrorResponse(409, 16, 'Horario no disponible')


            let booking = new Booking
            booking.Schedule = scheduleExist
            booking.Seat = seat
            booking.User = client
            booking.fromPurchase = purchaseId
            booking.isPass = isPass

            await getRepository(Booking).save(booking)
            await getRepository(Purchase).save(purchases[purchasePosition])
            await getRepository(ClassesHistory).save(classesHistory)
        }
    },

    async setBookingGroup(scheduleId: number, seatId: number, clientId: string, isPass: boolean, user: User) {

        const client = await getRepository(User).findOne(
            {
                where: {
                    id: user.id,
                    isDeleted: false
                }
            }
        )
        if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')

        let classesHistory = await getRepository(ClassesHistory).findOne({
            where: {
                User: client
            }
        })

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

        if (!client.isLeader) {
            if (!client.fromGroup) throw new ErrorResponse(404, 14, 'El cliente no pertenece a ningún grupo')
        }

        let mainUser

        if (client.fromGroup) {
            mainUser = client.fromGroup
        } else {
            mainUser = client.id
        }

        let currentDate = moment().tz("America/Mexico_City")
        let pendingClasses = 0
        let purchaseId = null
        let purchasePosition = null

        if (scheduleExist.isPrivate) {
            const purchases = await createQueryBuilder(Purchase)
                .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
                .where('Purchase.expirationDate>:cDate', { cDate: currentDate.format('YYYY-MM-DD') })
                .andWhere('Purchase.expirationDate<:scheduleDate', { cDate: moment(scheduleExist.date).format('YYYY-MM-DD') })
                .andWhere('(Purchase.status IN ("Completada") OR Purchase.status IS null)')
                .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
                .andWhere('Purchase.users_id=:userId', { userId: mainUser })
                .andWhere('Bundle.isGroup=:isGroup', { isGroup: true })
                .andWhere('Bundle.isGroup=:isPrivate', { isPrivate: true })
                .orderBy('Purchase.expirationDate', 'ASC')
                .getMany();

            if (!purchases) throw new ErrorResponse(409, 17, 'El usuario no puede reservar en esta clase')

            for (var i in purchases) {
                if (moment(purchases[i].date).format('YYYY-MM-DD') >= moment(scheduleExist.date).format('YYYY-MM-DD')) {

                    pendingClasses += (purchases[i].Bundle.classNumber + purchases[i].addedClasses)
                } else {
                    continue
                }

                if (pendingClasses == 0) {
                    purchaseId = purchases[i].id
                    purchasePosition = i
                    purchases[i].addedClasses -= 1
                    classesHistory.takenGroupClasses++
                    break
                }

            }

            if (purchaseId === null) throw new ErrorResponse(409, 17, 'No quedan clases disponibles')

            const schedule = await getRepository(Booking).findOne({
                where: {
                    Schedule: scheduleExist,
                    Seat: seat
                }
            })
            if (schedule) throw new ErrorResponse(409, 16, 'Horario no disponible')

            let booking = new Booking
            booking.Schedule = scheduleExist
            booking.Seat = seat
            booking.User = client
            booking.fromPurchase = purchaseId
            booking.isPass = isPass

            await getRepository(Booking).save(booking)
            await getRepository(Booking).save(purchases[purchasePosition])
            await getRepository(ClassesHistory).save(classesHistory)

        } else {

            const purchases = await createQueryBuilder(Purchase)
                .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
                .where('Date(Purchase.expirationDate) >:cDate', { cDate: currentDate.format('YYYY-MM-DD') })
                .andWhere('(Purchase.status IN ("Completada") OR Purchase.status IS null)')
                .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
                .andWhere('Purchase.users_id=:userId', { userId: mainUser })
                .andWhere('Bundle.isGroup=:isGroup', { isGroup: true })
                .andWhere('Bundle.isGroup=:isPrivate', { isPrivate: false })
                .orderBy('Purchase.expirationDate', 'ASC')
                .getMany();

            for (var i in purchases) {
                if (moment(purchases[i].date).format('YYYY-MM-DD') >= moment(scheduleExist.date).format('YYYY-MM-DD')) {
                    pendingClasses += (purchases[i].Bundle.classNumber + purchases[i].addedClasses)
                } else {
                    continue
                }


                if (pendingClasses > 0) {
                    purchaseId = purchases[i].id
                    purchasePosition = i
                    purchases[i].addedClasses -= 1
                    classesHistory.takenGroupClasses++
                    break
                }

            }

            if (purchaseId === null) throw new ErrorResponse(409, 17, 'No quedan clases disponibles')

            const schedule = await getRepository(Booking).findOne({
                where: {
                    Schedule: scheduleExist,
                    Seat: seat
                }
            })
            if (schedule) throw new ErrorResponse(409, 16, 'Horario no disponible')


            let booking = new Booking
            booking.Schedule = scheduleExist
            booking.Seat = seat
            booking.User = client
            booking.fromPurchase = purchaseId
            booking.isPass = isPass

            await getRepository(Booking).save(booking)
            await getRepository(Purchase).save(purchases[purchasePosition])
            await getRepository(ClassesHistory).save(classesHistory)
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
        if(typeof data.theme === "undefined"){
            updateSchedule.theme = null
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
        updateSchedule.theme = data.theme ? data.theme : updateSchedule.theme
        updateSchedule.isPrivate = data.isPrivate ? data.isPrivate : updateSchedule.isPrivate
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
            },
            relations: ['Schedule']
        })
        if (!booking) throw new ErrorResponse(409, 49, 'No existe esa reservacion')
        let currentDate = moment().tz("America/Mexico_City")

        if (currentDate.format('YYYY-MM-DD') != moment(booking.Schedule.date).format('YYYY-MM-DD')) throw new ErrorResponse(409, 49, 'Solo se puede pasar lista el dia de la clase')
        if (currentDate.add(20, 'minutes').format("HH:mm:ss") < booking.Schedule.start.toString()) throw new ErrorResponse(409, 49, 'Solo se puede pasar lista despues de la hora de inicio de la clase')

        booking.assistance = !booking.assistance

        await getRepository(Booking).save(booking)
    },

    async searchSchedule(query: string) {
        const schedules = await createQueryBuilder(Schedule)
            .select(["Schedule.id",
                "Schedule.date",
                "Schedule.start",
                "Schedule.end",
                "Instructor.id"
            ])
            .leftJoinAndSelect('Schedule.Instructor', 'Instructor')
            .where('Schedule.id like :query or Schedule.date like :query or Schedule.start like :query or Schedule.end like :query or Instructor.name like :query', {
                query: '%' + query + '%',
            })
            .limit(10)
            .orderBy('Schedule.id', 'DESC')
            .getMany()

        let data = []

        const seats = await createQueryBuilder(Seat)
            .getCount()

        for (var i in schedules) {
            let bookings = await getRepository(Booking).find({
                where: {
                    Schedule: schedules[i]
                }
            })
            data.push({
                ...schedules[i],
                available: seats - bookings.length
            })
        }

        return data
    }
}