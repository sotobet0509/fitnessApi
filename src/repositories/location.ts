import { Booking } from './../entities/Bookings';
import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Location } from '../entities/Locantions'
import { Room } from '../entities/Rooms'
import { Schedule } from '../entities/Schedules'
import * as moment from 'moment'
import { LocationSchema } from '../interfaces/location';
import { endianness } from 'os';


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

    async getLocationsByWeek(room_id: number, data: LocationSchema){
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
            const endDate = moment(data.start).add(7,'days')

            if(date.isSameOrAfter(data.start) && date.isBefore(endDate)) return true
            return false
        })
        const currentDay = moment(data.start).isoWeekday()

        let days = [ [], [], [], [], [], [], [] ]
        for (var i in filteredSchedules) {          
            const filteredSchedule = filteredSchedules[i]
            let day = moment(filteredSchedule.date).isoWeekday()
            if(day < currentDay) day = day + 7
            days[day-currentDay].push(filteredSchedule)
        }
        return days
    },
    
    async getSchedules(){
        const schedueles  = await getRepository(Schedule).find({
            relations: ['Instructor','Booking']
        })
        return schedueles
    }
   
}