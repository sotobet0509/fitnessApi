import { getRepository, getConnection, Repository, Not } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Bundle } from '../entities/Bundles'
import { Purchase } from '../entities/Purchases'
import { User } from '../entities/Users'


export const BundleRepository = {
    async getBundle(bundleId: number) {
        const bundle = await getRepository(Bundle).findOne({
            where: {
                id: bundleId
            }
        })
        if (!bundle) throw new ErrorResponse(404, 11, 'El paquete no existe')
        return bundle
    },

    async getAllBundles(userId: User) {
        let bundles
        if (userId != null) {
            const trialBundle = await getRepository(Bundle).findOne({
                where: {
                    name: "Paquete Prueba"
                }
            })
            const haveTrialBundle = await getRepository(Purchase).findOne({
                where: {
                    User: userId,
                    Bundle: trialBundle
                }
            })
            if (haveTrialBundle) {
                bundles = await getRepository(Bundle).find({
                    where: {
                        name: Not("Paquete Prueba")
                    }
                })
            } else {
                bundles = await getRepository(Bundle).find({})

            }

        } else {
            bundles = await getRepository(Bundle).find({})
        }


        return bundles
    },

    async updatePasses() {
        let purchases = await getRepository(Purchase).find({
            relations: ['Bundle']
        })

        for (var i in purchases) {
            purchases[i].addedPasses += purchases[i].Bundle.passes
            await getRepository(Purchase).save(purchases[i])
        }

        let bundles = await getRepository(Bundle).find()
        for (var i in bundles) {
            bundles[i].passes = 0
            await getRepository(Bundle).save(bundles[i])
        }
    }

}