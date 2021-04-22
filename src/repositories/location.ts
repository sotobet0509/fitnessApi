import { getRepository, createQueryBuilder } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Location } from '../entities/Locantions'
import { Room } from '../entities/Rooms'
import { Schedule } from '../entities/Schedules'
import * as moment from 'moment-timezone'
import { AdminLocationSchema, LocationSchema } from '../interfaces/location';
import { Instructor } from '../entities/Instructors';
import { User } from '../entities/Users';
import { Seat } from '../entities/Seats'
import { Booking } from '../entities/Bookings'


/*moment.locale('en', {
    week: {
        dow: 1
    }
})*/

export const LocationRepository = {
    async getLocation(locationId: number) {
        const location = await getRepository(Location).findOne({
            where: {
                id: locationId
            },
            relations: ['Room']
        })
        if (!location) throw new ErrorResponse(404, 12, 'La locación no existe')
        return location
    },

    async getAllLocations() {
        const locations = await getRepository(Location).find({})
        return locations
    },

    async getLocationsByWeek(room_id: number, data: LocationSchema, user: User) {
        let endDate
        let days
        let currentDate = moment().tz("America/Mexico_City")
        if (moment(data.start).day() == 6 || moment(data.start).day() == 0) {
            if (moment(data.start).day() == 6) {

                const scheduleExist = await createQueryBuilder(Schedule)
                    .where('Date(date)>=:cDate', { cDate: moment(currentDate).format('YYYY-MM-DD') })
                    .andWhere('Date(date)<:cuDate', { cuDate: moment(currentDate).add(1, 'days').format('YYYY-MM-DD') })
                    .andWhere('Time(end)>:cTime', { cTime: moment(currentDate).format("HH:mm:ss") })
                    .getOne()
                if (!scheduleExist) {
                    data.start = moment().isoWeek(moment(data.start).week()).startOf("isoWeek").add(-1, 'days').toDate()
                    days = [[], [], [], [], [], [], [], []]
                    endDate = moment(data.start).add(8, 'days')
                } else {
                    data.start = moment().isoWeek(moment(data.start).week() - 1).startOf("isoWeek").toDate()
                    days = [[], [], [], [], [], [], []]
                    endDate = moment(data.start).add(7, 'days')
                }
            } else {
                data.start = moment().isoWeek(moment(data.start).week() - 1).startOf("isoWeek").add(-1, 'days').toDate()
                days = [[], [], [], [], [], [], [], []]
                endDate = moment(data.start).add(8, 'days')
            }
        } else {
            data.start = moment().isoWeek(moment(data.start).week() - 1).startOf("isoWeek").toDate()
            days = [[], [], [], [], [], [], []]
            endDate = moment(data.start).add(7, 'days')
        }
        let room = await getRepository(Room).find({
            relations: ['Schedules', 'Schedules.Instructor', 'Schedules.Booking', 'Schedules.Rooms']
        })
        let room2
        if (days.length = 7) {
            room2 = await createQueryBuilder(Room)
                .leftJoinAndSelect("Room.Schedules", "Schedules")
                .leftJoinAndSelect("Schedules.Instructor", "Instructor")
                .leftJoinAndSelect("Schedules.Rooms", "Rooms")
                .where('Date(Schedules.date)>=:cDate', { cDate: moment(data.start).format('YYYY-MM-DD') })
                .andWhere('Date(Schedules.date)<:cuDate', { cuDate: moment(endDate).format('YYYY-MM-DD') })
                .orderBy("Schedules.date", "ASC")
                .addOrderBy("Schedules.start", "ASC")
                .getMany()

        } else {
            room2 = await createQueryBuilder(Room)
                .leftJoinAndSelect("Room.Schedules", "Schedules")
                .leftJoinAndSelect("Schedules.Instructor", "Instructor")
                .leftJoinAndSelect("Schedules.Rooms", "Rooms")
                .where('Date(Schedules.date)>=:cDate', { cDate: moment(data.start).format('YYYY-MM-DD') })
                .andWhere('Date(Schedules.date)<:cuDate', { cuDate: moment(endDate).format('YYYY-MM-DD') })
                .orderBy("Schedules.date", "ASC")
                .addOrderBy("Schedules.start", "ASC")
                .getMany()
        }

        if (!room) throw new ErrorResponse(404, 12, 'La sala no existe')
        if (!room2) throw new ErrorResponse(404, 12, 'La sala no existe')

        if (user) {
            if (!user.isAdmin) {
                for (var i in room) {
                    for (var j in room[i].Schedules) {
                        if (room[i].Schedules[j].isPrivate) {
                            delete room[i].Schedules[j]
                        }
                    }
                }
            }
        } else {
            for (var i in room) {
                for (var j in room[i].Schedules) {
                    if (room[i].Schedules[j].isPrivate) {
                        delete room[i].Schedules[j]
                    }
                }
            }
        }

        let filteredSchedules2 = []
        for (var i in room2) {
            const room3 = room2[i] as Room
            const seats = await createQueryBuilder(Seat)
                .where('Seat.rooms_id =:roomId', { roomId: room3.id })
                .getCount()


            for (var j in room3.Schedules) {
                const bookings = await createQueryBuilder(Booking)
                    .where('Booking.schedules_id =:scheduleId', { scheduleId: room3.Schedules[j].id })
                    .getCount()

                const available = seats - bookings

                let soldout = false
                if (available == 0) soldout = true

                delete room3.Schedules[j].Instructor.createdAt
                delete room3.Schedules[j].Instructor.lastname
                delete room3.Schedules[j].Instructor.description
                delete room3.Schedules[j].Instructor.profilePicture
                delete room3.Schedules[j].Instructor.largePicture
                delete room3.Schedules[j].Instructor.email
                delete room3.Schedules[j].Instructor.password
                delete room3.Schedules[j].Instructor.isDeleted
                delete room3.Schedules[j].Rooms.description

                filteredSchedules2.push({
                    ...room3.Schedules[j],
                    available: available,
                    occupied: bookings,
                    soldOut: soldout
                })
            }
        }


        /*let filteredSchedules = []
        for (var i in room) {
            const schedules = room[i].Schedules
            filteredSchedules = filteredSchedules.concat(schedules.filter((schedule: Schedule) => {
                delete schedule.Instructor.password
                delete schedule.Instructor.email
                delete schedule.Instructor.largePicture
                delete schedule.Instructor.profilePicture
                delete schedule.Instructor.isDeleted
                delete schedule.Instructor.description
                delete schedule.Instructor.lastname
                delete schedule.Instructor.createdAt

                const date = moment(schedule.date)
                if (date.isSameOrAfter(data.start) && date.isBefore(endDate)) return true
                return false
            }))
        }*/

        const currentDay = moment(data.start).isoWeekday()
        for (var i in filteredSchedules2) {
            const filteredSchedule = filteredSchedules2[i]
            //console.log(filteredSchedule)
            let day = moment(filteredSchedule.date).isoWeekday()
            if (day < currentDay) day = day + 7
            days[day - currentDay].push(filteredSchedule)
        }


        let temp = 0
        let flag = false
        if (days.length == 8) {
            for (var i in days[0]) {
                if (moment(data.start).format('YYYY-MM-DD') != moment(days[0][i].date).format('YYYY-MM-DD')) {
                    if (!flag) {
                        temp = parseInt(i)
                        flag = true
                    }
                    days[7].push(days[0][i])
                    //days[0].splice(i, 1)
                }
            }
            days[0].splice(temp, days[7].length)
        }
        return days
    },


    async getClientLocationsByWeek(room_id: number, data: LocationSchema, user: User) {

        const client = await getRepository(User).findOne({
            where: {
                id: user.id
            }
        })
        if (!client) throw new ErrorResponse(404, 13, 'Usuario no existe')

        let endDate
        let days
        let currentDate = moment().tz("America/Mexico_City")
        if (moment(data.start).day() == 6 || moment(data.start).day() == 0) {
            if (moment(data.start).day() == 6) {

                const scheduleExist = await createQueryBuilder(Schedule)
                    .where('Date(date)>=:cDate', { cDate: moment(currentDate).format('YYYY-MM-DD') })
                    .andWhere('Date(date)<:cuDate', { cuDate: moment(currentDate).add(1, 'days').format('YYYY-MM-DD') })
                    .andWhere('Time(end)>:cTime', { cTime: moment(currentDate).format("HH:mm:ss") })
                    .getOne()
                if (!scheduleExist) {
                    data.start = moment().isoWeek(moment(data.start).week()).startOf("isoWeek").add(-1, 'days').toDate()
                    days = [[], [], [], [], [], [], [], []]
                    endDate = moment(data.start).add(8, 'days')
                } else {
                    data.start = moment().isoWeek(moment(data.start).week() - 1).startOf("isoWeek").toDate()
                    days = [[], [], [], [], [], [], []]
                    endDate = moment(data.start).add(7, 'days')
                }
            } else {
                data.start = moment().isoWeek(moment(data.start).week() - 1).startOf("isoWeek").add(-1, 'days').toDate()
                days = [[], [], [], [], [], [], [], []]
                endDate = moment(data.start).add(8, 'days')
            }
        } else {
            data.start = moment().isoWeek(moment(data.start).week() - 1).startOf("isoWeek").toDate()
            days = [[], [], [], [], [], [], []]
            endDate = moment(data.start).add(7, 'days')
        }
        let room = await getRepository(Room).find({
            relations: ['Schedules', 'Schedules.Instructor', 'Schedules.Booking', 'Schedules.Rooms']
        })
        let room2
        if (days.length = 7) {
            room2 = await createQueryBuilder(Room)
                .leftJoinAndSelect("Room.Schedules", "Schedules")
                .leftJoinAndSelect("Schedules.Instructor", "Instructor")
                .leftJoinAndSelect("Schedules.Rooms", "Rooms")
                .where('Date(Schedules.date)>=:cDate', { cDate: moment(data.start).format('YYYY-MM-DD') })
                .andWhere('Date(Schedules.date)<:cuDate', { cuDate: moment(endDate).format('YYYY-MM-DD') })
                .orderBy("Schedules.date", "ASC")
                .addOrderBy("Schedules.start", "ASC")
                .getMany()

        } else {
            room2 = await createQueryBuilder(Room)
                .leftJoinAndSelect("Room.Schedules", "Schedules")
                .leftJoinAndSelect("Schedules.Instructor", "Instructor")
                .leftJoinAndSelect("Schedules.Rooms", "Rooms")
                .where('Date(Schedules.date)>=:cDate', { cDate: moment(data.start).format('YYYY-MM-DD') })
                .andWhere('Date(Schedules.date)<:cuDate', { cuDate: moment(endDate).format('YYYY-MM-DD') })
                .orderBy("Schedules.date", "ASC")
                .addOrderBy("Schedules.start", "ASC")
                .getMany()
        }

        if (!room) throw new ErrorResponse(404, 12, 'La sala no existe')
        if (!room2) throw new ErrorResponse(404, 12, 'La sala no existe')


        for (var i in room) {
            for (var j in room[i].Schedules) {
                if (room[i].Schedules[j].isPrivate) {
                    delete room[i].Schedules[j]
                }
            }
        }

        let filteredSchedules2 = []
        for (var i in room2) {
            const room3 = room2[i] as Room
            const seats = await createQueryBuilder(Seat)
                .where('Seat.rooms_id =:roomId', { roomId: room3.id })
                .getCount()


            for (var j in room3.Schedules) {
                const bookings = await createQueryBuilder(Booking)
                    .where('Booking.schedules_id =:scheduleId', { scheduleId: room3.Schedules[j].id })
                    .getCount()

                const available = seats - bookings

                let soldout = false
                if (available == 0) soldout = true

                delete room3.Schedules[j].Instructor.createdAt
                delete room3.Schedules[j].Instructor.lastname
                delete room3.Schedules[j].Instructor.description
                delete room3.Schedules[j].Instructor.profilePicture
                delete room3.Schedules[j].Instructor.largePicture
                delete room3.Schedules[j].Instructor.email
                delete room3.Schedules[j].Instructor.password
                delete room3.Schedules[j].Instructor.isDeleted
                delete room3.Schedules[j].Rooms.description
                delete room3.Schedules[j].Booking

                const clientBookings = await getRepository(Booking).findOne({
                    where: {
                        Schedule: room3.Schedules[j],
                        User: client
                    },
                    relations:["Seat"]
                })

                if (!clientBookings) {
                    filteredSchedules2.push({
                        ...room3.Schedules[j],
                        available: available,
                        occupied: bookings,
                        soldOut: soldout,
                        booking: null
                    })

                } else {
                    filteredSchedules2.push({
                        ...room3.Schedules[j],
                        available: available,
                        occupied: bookings,
                        soldOut: soldout,
                        booking: clientBookings
                    })
                }
            }
        }


        /*let filteredSchedules = []
        for (var i in room) {
            const schedules = room[i].Schedules
            filteredSchedules = filteredSchedules.concat(schedules.filter((schedule: Schedule) => {
                delete schedule.Instructor.password
                delete schedule.Instructor.email
                delete schedule.Instructor.largePicture
                delete schedule.Instructor.profilePicture
                delete schedule.Instructor.isDeleted
                delete schedule.Instructor.description
                delete schedule.Instructor.lastname
                delete schedule.Instructor.createdAt

                const date = moment(schedule.date)
                if (date.isSameOrAfter(data.start) && date.isBefore(endDate)) return true
                return false
            }))
        }*/

        const currentDay = moment(data.start).isoWeekday()
        for (var i in filteredSchedules2) {
            const filteredSchedule = filteredSchedules2[i]
            //console.log(filteredSchedule)
            let day = moment(filteredSchedule.date).isoWeekday()
            if (day < currentDay) day = day + 7
            days[day - currentDay].push(filteredSchedule)
        }


        let temp = 0
        let flag = false
        if (days.length == 8) {
            for (var i in days[0]) {
                if (moment(data.start).format('YYYY-MM-DD') != moment(days[0][i].date).format('YYYY-MM-DD')) {
                    if (!flag) {
                        temp = parseInt(i)
                        flag = true
                    }
                    days[7].push(days[0][i])
                    //days[0].splice(i, 1)
                }
            }
            days[0].splice(temp, days[7].length)
        }
        return days
    },

    async getAdminLocationsByWeek(room_id: number, data: AdminLocationSchema) {

        const client = await getRepository(User).findOne({
            where: {
                id: data.clientId
            }
        })
        if (!client) throw new ErrorResponse(404, 13, 'Usuario no existe')

        let endDate
        let days
        let currentDate = moment().tz("America/Mexico_City")
        if (moment(data.start).day() == 6 || moment(data.start).day() == 0) {
            if (moment(data.start).day() == 6) {

                const scheduleExist = await createQueryBuilder(Schedule)
                    .where('Date(date)>=:cDate', { cDate: moment(currentDate).format('YYYY-MM-DD') })
                    .andWhere('Date(date)<:cuDate', { cuDate: moment(currentDate).add(1, 'days').format('YYYY-MM-DD') })
                    .andWhere('Time(end)>:cTime', { cTime: moment(currentDate).format("HH:mm:ss") })
                    .getOne()
                if (!scheduleExist) {
                    data.start = moment().isoWeek(moment(data.start).week()).startOf("isoWeek").add(-1, 'days').toDate()
                    days = [[], [], [], [], [], [], [], []]
                    endDate = moment(data.start).add(8, 'days')
                } else {
                    data.start = moment().isoWeek(moment(data.start).week() - 1).startOf("isoWeek").toDate()
                    days = [[], [], [], [], [], [], []]
                    endDate = moment(data.start).add(7, 'days')
                }
            } else {
                data.start = moment().isoWeek(moment(data.start).week() - 1).startOf("isoWeek").add(-1, 'days').toDate()
                days = [[], [], [], [], [], [], [], []]
                endDate = moment(data.start).add(8, 'days')
            }
        } else {
            data.start = moment().isoWeek(moment(data.start).week() - 1).startOf("isoWeek").toDate()
            days = [[], [], [], [], [], [], []]
            endDate = moment(data.start).add(7, 'days')
        }
        let room = await getRepository(Room).find({
            relations: ['Schedules', 'Schedules.Instructor', 'Schedules.Booking', 'Schedules.Rooms']
        })
        let room2
        if (days.length = 7) {
            room2 = await createQueryBuilder(Room)
                .leftJoinAndSelect("Room.Schedules", "Schedules")
                .leftJoinAndSelect("Schedules.Instructor", "Instructor")
                .leftJoinAndSelect("Schedules.Rooms", "Rooms")
                .where('Date(Schedules.date)>=:cDate', { cDate: moment(data.start).format('YYYY-MM-DD') })
                .andWhere('Date(Schedules.date)<:cuDate', { cuDate: moment(endDate).format('YYYY-MM-DD') })
                .orderBy("Schedules.date", "ASC")
                .addOrderBy("Schedules.start", "ASC")
                .getMany()

        } else {
            room2 = await createQueryBuilder(Room)
                .leftJoinAndSelect("Room.Schedules", "Schedules")
                .leftJoinAndSelect("Schedules.Instructor", "Instructor")
                .leftJoinAndSelect("Schedules.Rooms", "Rooms")
                .where('Date(Schedules.date)>=:cDate', { cDate: moment(data.start).format('YYYY-MM-DD') })
                .andWhere('Date(Schedules.date)<:cuDate', { cuDate: moment(endDate).format('YYYY-MM-DD') })
                .orderBy("Schedules.date", "ASC")
                .addOrderBy("Schedules.start", "ASC")
                .getMany()
        }

        if (!room) throw new ErrorResponse(404, 12, 'La sala no existe')
        if (!room2) throw new ErrorResponse(404, 12, 'La sala no existe')


        for (var i in room) {
            for (var j in room[i].Schedules) {
                if (room[i].Schedules[j].isPrivate) {
                    delete room[i].Schedules[j]
                }
            }
        }



        let filteredSchedules2 = []
        for (var i in room2) {
            const room3 = room2[i] as Room
            const seats = await createQueryBuilder(Seat)
                .where('Seat.rooms_id =:roomId', { roomId: room3.id })
                .getCount()


            for (var j in room3.Schedules) {
                const bookings = await createQueryBuilder(Booking)
                    .where('Booking.schedules_id =:scheduleId', { scheduleId: room3.Schedules[j].id })
                    .getCount()

                const available = seats - bookings

                let soldout = false
                if (available == 0) soldout = true

                delete room3.Schedules[j].Instructor.createdAt
                delete room3.Schedules[j].Instructor.lastname
                delete room3.Schedules[j].Instructor.description
                delete room3.Schedules[j].Instructor.profilePicture
                delete room3.Schedules[j].Instructor.largePicture
                delete room3.Schedules[j].Instructor.email
                delete room3.Schedules[j].Instructor.password
                delete room3.Schedules[j].Instructor.isDeleted
                delete room3.Schedules[j].Rooms.description
                delete room3.Schedules[j].Booking

                const clientBookings = await getRepository(Booking).findOne({
                    where: {
                        Schedule: room3.Schedules[j],
                        User: client
                    },
                    relations:["Seat"]
                })

                if (!clientBookings) {
                    filteredSchedules2.push({
                        ...room3.Schedules[j],
                        available: available,
                        occupied: bookings,
                        soldOut: soldout,
                        booking: null
                    })

                } else {
                    filteredSchedules2.push({
                        ...room3.Schedules[j],
                        available: available,
                        occupied: bookings,
                        soldOut: soldout,
                        booking: clientBookings
                    })
                }
            }
        }


        /*let filteredSchedules = []
        for (var i in room) {
            const schedules = room[i].Schedules
            filteredSchedules = filteredSchedules.concat(schedules.filter((schedule: Schedule) => {
                delete schedule.Instructor.password
                delete schedule.Instructor.email
                delete schedule.Instructor.largePicture
                delete schedule.Instructor.profilePicture
                delete schedule.Instructor.isDeleted
                delete schedule.Instructor.description
                delete schedule.Instructor.lastname
                delete schedule.Instructor.createdAt

                const date = moment(schedule.date)
                if (date.isSameOrAfter(data.start) && date.isBefore(endDate)) return true
                return false
            }))
        }*/

        const currentDay = moment(data.start).isoWeekday()
        for (var i in filteredSchedules2) {
            const filteredSchedule = filteredSchedules2[i]
            //console.log(filteredSchedule)
            let day = moment(filteredSchedule.date).isoWeekday()
            if (day < currentDay) day = day + 7
            days[day - currentDay].push(filteredSchedule)
        }


        let temp = 0
        let flag = false
        if (days.length == 8) {
            for (var i in days[0]) {
                if (moment(data.start).format('YYYY-MM-DD') != moment(days[0][i].date).format('YYYY-MM-DD')) {
                    if (!flag) {
                        temp = parseInt(i)
                        flag = true
                    }
                    days[7].push(days[0][i])
                    //days[0].splice(i, 1)
                }
            }
            days[0].splice(temp, days[7].length)
        }
        return days
    },


    async getSchedules(page: string) {
        const pages = parseInt(page)


        const schedules = await createQueryBuilder(Schedule)
            .select([
                'Schedule',
                'Instructor.name as ´instructoName´',
                'Room.name as ´roomName´'
            ])
            .leftJoinAndSelect("Schedule.Instructor", "Instructor")
            .leftJoinAndSelect("Schedule.Rooms", "Room")
            .skip(pages * 10)
            .take(10)
            .orderBy("Schedule.id", "DESC")
            .getMany()


        const pagesNumber = await createQueryBuilder(Schedule)
            .select([
                'Schedule.id'
            ])
            .leftJoinAndSelect("Schedule.Instructor", "Instructor")
            .leftJoinAndSelect("Schedule.Rooms", "Room")
            .skip(pages * 10)
            .take(10)
            .orderBy("Schedule.id", "DESC")
            .getCount()

        let data = []

        const seat = await getRepository(Seat).find()
        let seatlengt = seat.length

        for (var i in schedules) {
            const bookings = await getRepository(Booking).find({
                where: {
                    Schedule: schedules[i]
                }
            })
            let soldout = false
            if (seatlengt == bookings.length) {
                soldout = true
            }

            data.push({
                ...schedules[i],
                soldOut: soldout,
                available: seatlengt - bookings.length
            })
        }

        return { data, pages: pagesNumber }
    },

    async getInstructorSchedules(instructor: Instructor, data: LocationSchema) {
        const schedules = await getRepository(Schedule).find({
            relations: ['Instructor', 'Booking', 'Rooms']
        })

        const filteredSchedules = schedules.filter((schedule: Schedule) => {
            const date = moment(schedule.date)
            const endDate = moment(data.start).add(7, 'days')

            if (date.isSameOrAfter(data.start) && date.isBefore(endDate)) return true
            return false
        })

        let filterSchedules: Schedule[] = []

        for (var i in filteredSchedules) {
            if (filteredSchedules[i].Instructor.id === instructor.id) {
                filterSchedules.push(filteredSchedules[i])
            }
            else if (filteredSchedules[i].Instructor.isDeleted) {
                let names = filteredSchedules[i].Instructor.name.split(" ")
                for (var j in names) {
                    if (names[j].toLowerCase() == instructor.name.toLowerCase()) {
                        filterSchedules.push(filteredSchedules[i])
                    }
                }
            }
        }
        return filterSchedules
    }

}