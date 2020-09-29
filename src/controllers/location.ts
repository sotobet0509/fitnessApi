import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
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