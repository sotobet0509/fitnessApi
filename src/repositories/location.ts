import { Booking } from './../entities/Bookings';
import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Location } from '../entities/Locantions'
import { Room } from '../entities/Rooms'
import { Schedule } from '../entities/Schedules'
import * as moment from 'moment'
import { LocationSchema } from '../interfaces/location';


moment.locale('en',{
    week: {
        dow: 1
    }
})

export const LocationRepository = {
    async getLocation(locationId: number){
        const location = await getRepository(Location).findOne({
            where: {
                id: locationId
            },
            relations: ['Room']
        })
        if (!location) throw new ErrorResponse(404, 12, 'La locación no existe')
        return location
    },

    async getAllLocations(){
        const locations  = await getRepository(Location).find({})
        return locations
    },

    async getLocationsByWeek(room_id: number, year: number, month: number, week: number){
        const room = await getRepository(Room).findOne({
            where: {
                id: room_id
            },
            relations: ['Schedules','Schedules.Instructor','Schedules.Booking']
        })
        if (!room) throw new ErrorResponse(404, 12, 'La sala no existe')
        const schedules = room.Schedules
        console.log(schedules)
        const filteredSchedules = schedules.filter((schedule: Schedule) =>{
            const date = moment(schedule.date)
            const _year = date.year()
            const _week = date.week()
            if(year === _year && week === _week) return true
            return false
        })
        let days = [ [], [], [], [], [], [], [] ]
        for (var i in filteredSchedules) {
            const filteredSchedule = filteredSchedules[i]
            days[moment(filteredSchedule.date).isoWeekday()-1].push(filteredSchedule)
        }

        console.log(schedules)

       /* const filteredSchedules2 = schedules.filter((schedule: Schedule) =>{
            const date = moment(schedule.date)
            const _year = date.weekYear()
            const _week = date.week()
            console.log(_week, week +1, year, _year )
            if(year === _year && (week+1) === _week) return true
            return false
        })
        for (var i in filteredSchedules2) {
            //console.log(filteredSchedules2[i])
            const filteredSchedule2 = filteredSchedules2[i]
            filteredSchedule2.date.getDay() == 0 && days[6].push(filteredSchedule2)
        }*/

        return days
    },
    
    async getSchedules(){
        const schedueles  = await getRepository(Schedule).find({
            relations: ['Instructor','Booking']
        })
        return schedueles
    },
    /*async getLocationsByWeek2(room_id: number, data: LocationSchema){
        const room = await getRepository(Room).findOne({
            where: {
                id: room_id
            },
            relations: ['Schedules','Schedules.Instructor','Schedules.Booking']
        })
        if (!room) throw new ErrorResponse(404, 12, 'La sala no existe')

        const schedules = room.Schedules
        console.log(schedules)
        const filteredSchedules = schedules.filter((schedule: Schedule) =>{
            const date = moment(schedule.date)
            const enDate = moment(data.start).add(7, 'days')
            if(year === _year && week === _week) return true
            return false
        })
        let days = [ [], [], [], [], [], [], [] ]
        for (var i in filteredSchedules) {
            const filteredSchedule = filteredSchedules[i]
            days[moment(filteredSchedule.date).isoWeekday()-1].push(filteredSchedule)
        }

        console.log(schedules)

       /* const filteredSchedules2 = schedules.filter((schedule: Schedule) =>{
            const date = moment(schedule.date)
            const _year = date.weekYear()
            const _week = date.week()
            console.log(_week, week +1, year, _year )
            if(year === _year && (week+1) === _week) return true
            return false
        })
        for (var i in filteredSchedules2) {
            //console.log(filteredSchedules2[i])
            const filteredSchedule2 = filteredSchedules2[i]
            filteredSchedule2.date.getDay() == 0 && days[6].push(filteredSchedule2)
        }

        return days
    },*/

}