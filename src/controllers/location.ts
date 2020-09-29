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
import { LocationRepository } from '../repositories/location'


export const LocationController ={

    async getLocation(req: ExtendedRequest, res: Response){
        const locationId = parseInt(req.params.location_id)
        const location = await LocationRepository.getLocation(locationId)
        res.json({ success: true, data: location})
        
    },

    async getAllLocations(req: ExtendedRequest, res: Response){
        const locations = await LocationRepository.getAllLocations()
        res.json({ success: true, data: locations})
    },

    async getLocationsByWeek(req: ExtendedRequest, res: Response){
        const locationId = parseInt(req.params.location_id)
        const roomId = parseInt(req.params.room_id)
        const year = parseInt(req.params.year)
        const mounth = parseInt(req.params.mounth)
        const week = parseInt(req.params.week)

        const locations = await LocationRepository.getLocationsByWeek()
        res.json({ success: true, locations})

    }
}