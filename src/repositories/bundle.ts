import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Bundle } from '../entities/Bundles'

export const BundleRepository = {
    async getBundle(bundleId: number){
        const bundle = await getRepository(Bundle).findOne({
            where: {
                id: bundleId
            }
        })
        if (!bundle) throw new ErrorResponse(404, 11, 'El paquete no existe')
        return bundle
    },

    async getAllBundles(){
        const bundles = await getRepository(Bundle).find({})
        return bundles
    }

}