import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { BundleRepository } from '../repositories/bundle'
import { ErrorResponse } from '../errors/ErrorResponse'
import { TokenService } from '../services/token'
import { User } from '../entities/Users'
import { getRepository } from 'typeorm'
import { BlackList } from '../entities/BlackList'
import { DataMissingError } from '../errors/DataMissingError'
import { BundleSchema, UpdateBundleSchema } from '../interfaces/bundle'
import { handleProfilePicture } from '../services/files'

export const BundleController = {

    async getBundle(req: ExtendedRequest, res: Response) {
        const bundleId = parseInt(req.params.bundle_id)
        const bundle = await BundleRepository.getBundle(bundleId)
        res.json({ success: true, data: bundle })

    },

    async getAllBundles(req: ExtendedRequest, res: Response) {
        let user = null
        const token = req.header('Authorization')
        if (token) {
            const payload = await TokenService.verifyToken(token)
            const userRepository = getRepository(User)
            user = await userRepository.findOne(payload.sub)
            const blackListToken = await getRepository(BlackList).findOne({
                where: {
                    token: token
                }
            })
            if (blackListToken) throw new ErrorResponse(403, 48, 'El token se encuentra en la BlackList')
        }

        const bundles = await BundleRepository.getAllBundles(user)
        res.json({ success: true, data: bundles })
    },

    async updatePasses(req: ExtendedRequest, res: Response) {
        await BundleRepository.updatePasses()
        res.json({ success: true })
    },
    async getAllDiscounts(req: ExtendedRequest, res: Response) {
        const discount = await BundleRepository.getAllDiscounts()
        res.json({ success: true, discount })
    },

    async createBundle(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const userSchema = Joi.object().keys({
            name: Joi.string().required(),
            price: Joi.number().required(),
            offer: Joi.number(),
            description: Joi.string().required(),
            classNumber: Joi.number(),
            expirationDays: Joi.number().required(),
            passes: Joi.number(),
            isUnlimited: Joi.boolean(),
            isSpecial: Joi.boolean(),
            especialDescription: Joi.string(),
            promotionExpirationDays: Joi.number(),
            pictureUrl: Joi.string(),
            alternateUserId: Joi.string(),
            email: Joi.string(),
            password: Joi.string(),
            collaboratorName: Joi.string(),
            contact: Joi.string(),
            isGroup: Joi.boolean(),
            memberLimit: Joi.number()
        })
        const { error, value } = userSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <BundleSchema>value
        if(req.files){
            const url = await handleProfilePicture(req.files.file)
            data.pictureUrl= url
        }
        await BundleRepository.createBundle(data)
        res.json({ success: true })

    },

    async changeBundleStatus(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const bundleId = parseInt(req.params.bundle_id)

        await BundleRepository.changeBundleStatus(bundleId)
        res.json({ success: true })

    },

    async updateBundle(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        
        const bundleId = parseInt(req.params.bundle_id)
        const userSchema = Joi.object().keys({
            name: Joi.string(),
            price: Joi.number(),
            offer: Joi.number(),
            description: Joi.string(),
            classNumber: Joi.number(),
            expirationDays: Joi.number(),
            passes: Joi.number(),
            isUnlimited: Joi.boolean(),
            isSpecial: Joi.boolean(),
            especialDescription: Joi.string(),
            promotionExpirationDays: Joi.number(),
            pictureUrl: Joi.string(),
            alternateUserId: Joi.string(),
            email: Joi.string(),
            password: Joi.string(),
            collaboratorName: Joi.string(),
            contact: Joi.string(),
            isGroup: Joi.boolean(),
            memberLimit: Joi.number()
        })
        const { error, value } = userSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <UpdateBundleSchema>value

        await BundleRepository.updateBundle(data, bundleId)
        res.json({ success: true })

    },
}