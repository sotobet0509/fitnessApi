import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { BundleRepository } from '../repositories/bundle'
import { ErrorResponse } from '../errors/ErrorResponse'
import { BookingRepository } from '../repositories/booking'
import { VersionRepository } from '../repositories/version'

export const VersionController ={

    async getLastVersion(req: ExtendedRequest, res: Response){
        

        const version = await VersionRepository.getLastVersion()
        res.json({ success: true, version})
    },

    
}