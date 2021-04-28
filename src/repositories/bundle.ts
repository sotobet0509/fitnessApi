import { getRepository, getConnection, Repository, Not, createQueryBuilder } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Bundle } from '../entities/Bundles'
import { Purchase } from '../entities/Purchases'
import { User } from '../entities/Users'
import { Discounts } from '../entities/Discounts'
import { BundleSchema, UpdateBundleSchema } from '../interfaces/bundle'
import { Alternate_users } from '../entities/alternateUsers'
import { PasswordService } from '../services/password'


export const BundleRepository = {
    async getBundle(bundleId: number) {

        const bundle = await getRepository(Bundle).findOne({
            where: {
                id: bundleId
            }
        })
        if (!bundle) throw new ErrorResponse(404, 11, 'El paquete no existe')

        let alternateUser
        if (bundle.altermateUserId) {
            alternateUser = await getRepository(Alternate_users).findOne({
                where: {
                    id: bundle.altermateUserId
                }
            })
        }

        return {
            ...bundle,
            alternateUser
        }
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
                if (userId.fromGroup) {
                    bundles = await getRepository(Bundle).find({
                        where: {
                            isGroup: false,
                            name: Not("Paquete Prueba")
                        }
                    })
                } else {
                    bundles = await getRepository(Bundle).find({
                        where: {
                            name: Not("Paquete Prueba")
                        }
                    })
                }

            } else {
                if (userId.fromGroup) {
                    bundles = await getRepository(Bundle).find({
                        where: {
                            isGroup: false
                        }
                    })
                } else {
                    bundles = await getRepository(Bundle).find({})
                }
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
    },
    async getAllDiscounts() {
        const discounts = await getRepository(Discounts).find({

        })
        if (!discounts) throw new ErrorResponse(404, 53, 'No hay descuentos disponibles')
        return discounts
    },

    async createBundle(data: BundleSchema) {
        let collaborator = new Alternate_users()
        if (!data.alternateUserId && data.isSpecial) {
            collaborator.email = data.email

            if (data.password) {
                const passwordService = new PasswordService(data.password)
                const password = await passwordService.getHashedPassword()
                collaborator.password = password
            }

            collaborator.name = data.collaboratorName
            collaborator.contact = data.contact

            let collaboratorId = new Date().toLocaleDateString()
            collaboratorId = collaboratorId.split("/").join("")
            collaboratorId = collaboratorId.split("-").join("")
            const temp = Math.floor((Math.random() * (1000 - 0)) + 0).toString()
            collaboratorId = collaboratorId + temp
            collaboratorId = collaboratorId.substring(2, collaboratorId.length - 1)
            collaborator.id = collaboratorId

            if (data.email) await getRepository(Alternate_users).save(collaborator)
        }

        let newBundle = new Bundle()
        newBundle.isDeleted = false
        newBundle.isRecurrent = false
        newBundle.altermateUserId = null
        newBundle.name = data.name ? data.name : newBundle.name
        newBundle.price = data.price ? data.price : newBundle.price
        newBundle.offer = data.offer ? data.offer : newBundle.offer
        newBundle.description = data.description ? data.description : newBundle.description
        newBundle.classNumber = data.classNumber ? data.classNumber : newBundle.classNumber
        if (newBundle.classNumber == 0) {
            newBundle.classNumber = 1
        }
        if (data.isUnlimited) newBundle.classNumber = 100
        newBundle.expirationDays = data.expirationDays ? data.expirationDays : newBundle.expirationDays
        newBundle.passes = data.passes ? data.passes : 0
        newBundle.isUnlimited = data.isUnlimited ? data.isUnlimited : newBundle.isUnlimited
        if (data.isGroup) {
            newBundle.isGroup = data.isGroup ? data.isGroup : newBundle.isGroup
            newBundle.memberLimit = data.memberLimit ? data.memberLimit : newBundle.memberLimit
        }
        if (data.isSpecial) {
            newBundle.isEspecial = data.isSpecial ? data.isSpecial : newBundle.isEspecial
            newBundle.especialDescription = data.especialDescription ? data.especialDescription : newBundle.especialDescription
            newBundle.promotionExpirationDays = data.promotionExpirationDays ? data.promotionExpirationDays : newBundle.promotionExpirationDays
            newBundle.pictureUrl = data.pictureUrl ? data.pictureUrl : newBundle.pictureUrl
            if (!data.alternateUserId) {
                newBundle.altermateUserId = parseInt(collaborator.id)
            } else {
                newBundle.altermateUserId = parseInt(data.alternateUserId)
            }
        }

        await getRepository(Bundle).save(newBundle)
    },
    async changeBundleStatus(bundleId: number) {
        const bundle = await getRepository(Bundle).findOne({
            where: {
                id: bundleId
            }
        })
        if (!bundle) throw new ErrorResponse(404, 56, 'El paquete no existe')

        bundle.isDeleted = !bundle.isDeleted

        await getRepository(Bundle).save(bundle)
    },

    async updateBundle(data: UpdateBundleSchema, bundleId: number) {
        let updateBundle = await getRepository(Bundle).findOne({
            where: {
                id: bundleId
            }
        })
        if (!updateBundle) throw new ErrorResponse(404, 56, 'El paquete no existe')

        let collaborator = new Alternate_users()
        if (!data.alternateUserId) {
            collaborator.email = data.email

            if (data.password) {
                const passwordService = new PasswordService(data.password)
                const password = await passwordService.getHashedPassword()
                collaborator.password = password
            }

            collaborator.name = data.collaboratorName
            collaborator.contact = data.contact

            let collaboratorId = new Date().toLocaleDateString()
            collaboratorId = collaboratorId.split("/").join("")
            collaboratorId = collaboratorId.split("-").join("")
            const temp = Math.floor((Math.random() * (1000 - 0)) + 0).toString()
            collaboratorId = collaboratorId + temp
            collaboratorId = collaboratorId.substring(2, collaboratorId.length - 1)
            collaborator.id = collaboratorId

            if (data.email) await getRepository(Alternate_users).save(collaborator)
        }

        updateBundle.name = data.name ? data.name : updateBundle.name
        updateBundle.price = data.price ? data.price : updateBundle.price
        updateBundle.offer = data.offer ? data.offer : updateBundle.offer
        updateBundle.description = data.description ? data.description : updateBundle.description
        updateBundle.classNumber = data.classNumber ? data.classNumber : updateBundle.classNumber
        if (updateBundle.classNumber == 0) {
            updateBundle.classNumber = 1
        }
        updateBundle.expirationDays = data.expirationDays ? data.expirationDays : updateBundle.expirationDays
        updateBundle.passes = data.passes ? data.passes : updateBundle.passes
        if (data.isUnlimited) {
            updateBundle.isUnlimited = true
            updateBundle.classNumber = 100
        } else if (data.isUnlimited === false) {
            updateBundle.isUnlimited = false
        }

        if (data.isGroup) {
            updateBundle.isGroup = data.isGroup ? data.isGroup : updateBundle.isGroup
            updateBundle.memberLimit = data.memberLimit ? data.memberLimit : updateBundle.memberLimit
        }
        if (updateBundle.isGroup && data.isGroup == false) {
            updateBundle.isGroup = false
            updateBundle.memberLimit = 0
        }

        updateBundle.isEspecial = data.isSpecial ? data.isSpecial : updateBundle.isEspecial
        updateBundle.especialDescription = data.especialDescription ? data.especialDescription : updateBundle.especialDescription
        updateBundle.promotionExpirationDays = data.promotionExpirationDays ? data.promotionExpirationDays : updateBundle.promotionExpirationDays
        if (!data.alternateUserId) {
            updateBundle.altermateUserId = parseInt(collaborator.id)
        } else {
            updateBundle.altermateUserId = parseInt(data.alternateUserId) ? parseInt(data.alternateUserId) : updateBundle.altermateUserId
        }


        await getRepository(Bundle).save(updateBundle)
    },
}