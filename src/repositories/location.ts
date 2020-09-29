import { getRepository, getConnection, Repository } from 'typeorm'
import { User } from '../entities/Users'
import { TokenService } from '../services/token'
import { ErrorResponse } from '../errors/ErrorResponse'
import { getParsedCommandLineOfConfigFile } from 'typescript'
import { Purchase } from '../entities/Purchases'
import { Bundle } from '../entities/Bundles'
import { Payment_method } from '../entities/Payment_methods'
import { Booking } from '../entities/Bookings'
import { build } from 'swagger-express-ts'
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