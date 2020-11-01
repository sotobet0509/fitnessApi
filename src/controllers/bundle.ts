import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { BundleRepository } from '../repositories/bundle'

export const BundleController ={

    async getBundle(req: ExtendedRequest, res: Response){
        const bundleId = parseInt(req.params.bundle_id)
        const bundle = await BundleRepository.getBundle(bundleId)
        res.json({ success: true, data: bundle})
        
    },

    async getAllBundles(req: ExtendedRequest, res: Response){
        const bundles = await BundleRepository.getAllBundles()
        res.json({ success: true, data: bundles})
    },

    async updatePasses(req: ExtendedRequest, res: Response){
        await BundleRepository.updatePasses()
        res.json({ success: true})
    }
}