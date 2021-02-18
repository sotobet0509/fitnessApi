import { Booking } from './../entities/Bookings';
import { getRepository, getConnection, Repository, createQueryBuilder } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Location } from '../entities/Locantions'
import { Room } from '../entities/Rooms'
import { Schedule } from '../entities/Schedules'
import * as moment from 'moment'
import { LocationSchema } from '../interfaces/location';
import { endianness } from 'os';
import { Instructor } from '../entities/Instructors';
import { User } from '../entities/Users';


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
        //console.log( moment().isoWeek(moment(data.start).week() - 1).startOf("isoWeek").toDate())
        if (moment(data.start).day() == 5 || moment(data.start).day() == 6) {
            if (moment(data.start).day() == 5) {

                let currentDate = moment()
                const scheduleExist = await createQueryBuilder(Schedule)
                    .where('Date(Schedule.date)>=:cDate', { cDate: moment(currentDate).format('YYYY-MM-DD') })
                    .andWhere('Date(Schedule.date)<:cuDate', { cuDate: moment(currentDate).add(1, 'days').format('YYYY-MM-DD') })
                    .andWhere('Time(Schedule.start)>:cTime', { cTime: moment(currentDate).format("HH:mm:ss") })
                    .getOne()
                //console.log(scheduleExist)
                if (!scheduleExist) {
                    //console.log("esta vacio")
                    data.start = moment().isoWeek(moment(data.start).week()).startOf("isoWeek").add(-1, 'days').toDate()
                    days = [[], [], [], [], [], [], [], []]
                    endDate = moment(data.start).add(8, 'days')
                } else {
                    //console.log("no esta vacio")
                    data.start = moment().isoWeek(moment(data.start).week() - 1).startOf("isoWeek").toDate()
                    days = [[], [], [], [], [], [], []]
                    endDate = moment(data.start).add(7, 'days')
                }
            } else {
                data.start = moment().isoWeek(moment(data.start).week()).startOf("isoWeek").add(-1, 'days').toDate()
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
        if (!room) throw new ErrorResponse(404, 12, 'La sala no existe')

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



        let filteredSchedules = []
        for (var i in room) {
            const schedules = room[i].Schedules
            filteredSchedules = filteredSchedules.concat(schedules.filter((schedule: Schedule) => {
                const date = moment(schedule.date)
                if (date.isSameOrAfter(data.start) && date.isBefore(endDate)) return true
                return false
            }))
        }

        const currentDay = moment(data.start).isoWeekday()

        for (var i in filteredSchedules) {
            const filteredSchedule = filteredSchedules[i]
            let day = moment(filteredSchedule.date).isoWeekday()
            if (day < currentDay) day = day + 7
            days[day - currentDay].push(filteredSchedule)
        }


        if (days.length == 8) {
            for (var i in days[0]) {
                if (moment(data.start).format('YYYY-MM-DD') != moment(days[0][i].date).format('YYYY-MM-DD')) {
                    days[7].push(days[0][i])
                    days[0].splice(i,1)
                }
            }
        }

        return days
    },

    async getSchedules() {
        const schedueles = await getRepository(Schedule).find({
            relations: ['Instructor', 'Booking', 'Rooms']
        })
        return schedueles
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