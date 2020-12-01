import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { BundleRepository } from '../repositories/bundle'
import { ErrorResponse } from '../errors/ErrorResponse'
import { TokenService } from '../services/token'
import { User } from '../entities/Users'
import { getRepository } from 'typeorm'
import { BlackList } from '../entities/BlackList'

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
    }
}