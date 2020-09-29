import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Location } from '../entities/Locantions'

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

    async getLocationsByWeek(){
        const locations  = await getRepository(Location).find({
            where: {
                
            }
        })
        return locations
    }

}