import { Booking } from './../entities/Bookings';
import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Location } from '../entities/Locantions'
import { Room } from '../entities/Rooms'
import { Schedule } from '../entities/Schedules'
import * as moment from 'moment'

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
        console.log(room_id)
        const room = await getRepository(Room).findOne({
            where: {
                id: room_id
            },
            relations: ['Schedules']
        })
        if (!room) throw new ErrorResponse(404, 12, 'La sala no existe')
        const schedules = room.Schedules
        const filteredSchedules = schedules.filter((schedule: Schedule) =>{
            const date = moment(schedule.date)
            const _year = date.year()
            const _month = date.month() + 1
            const _week = date.week()
            if(year === _year && month === _month && week === _week) return true
            return false
        })
        let days = [ [], [], [], [], [], [], [] ]
        for (var i in filteredSchedules) {
            const filteredSchedule = filteredSchedules[i]
            days[filteredSchedule.date.getDay()].push(filteredSchedule)
        }
        return days
    }

}