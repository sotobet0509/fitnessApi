import { Request, Response } from 'express'
import axios from 'axios'
import Joi = require('@hapi/joi')
import config from '../config'
import { DataMissingError } from '../errors/DataMissingError'
import { ErrorResponse } from '../errors/ErrorResponse'
import { AuthRepository } from '../repositories/auth'
import { TokenService } from '../services/token'
import { ExtendedRequest } from '../../types'
import { MeRepository } from '../repositories/me'
import { BundleRepository } from '../repositories/bundle'


export const BundleController ={

    async getBundle(req: ExtendedRequest, res: Response){
        const bundleId = parseInt(req.params.bundle_id)
        const bundle = await BundleRepository.getBundle(bundleId)
        res.json({ success: true, data: bundle})
        
    }
}