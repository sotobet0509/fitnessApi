import { getRepository, getConnection, Repository } from 'typeorm'
import { User } from '../entities/Users'
import { TokenService } from '../services/token'
import { ErrorResponse } from '../errors/ErrorResponse'
import { getParsedCommandLineOfConfigFile } from 'typescript'
import { Purchase } from '../entities/Purchases'
import { Bundle } from '../entities/Bundles'
import { Payment_method } from '../entities/Payment_methods'
import { Booking } from '../entities/Bookings'

export const BundleRepository = {
    async getBundle(bundleId: number){
        const bundle = await getRepository(Bundle).findOne({
            where: {
                id: bundleId
            }
        })
        if (!bundle) throw new ErrorResponse(404, 11, 'El paquete no existe')
        return bundle
    }
}