import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { LocationRepository } from '../repositories/location'
import { ErrorResponse } from '../errors/ErrorResponse'
import { DataMissingError } from '../errors/DataMissingError'
import { LocationSchema } from '../interfaces/location'
import { TokenService } from '../services/token'
import { getRepository } from 'typeorm'
import { User } from '../entities/Users'

export const LocationController = {

    async getLocation(req: ExtendedRequest, res: Response) {
        const locationId = parseInt(req.params.location_id)
        const location = await LocationRepository.getLocation(locationId)
        res.json({ success: true, data: location })

    },

    async getAllLocations(req: ExtendedRequest, res: Response) {
        const locations = await LocationRepository.getAllLocations()
        res.json({ success: true, data: locations })
    },

    async getLocationsByWeek(req: ExtendedRequest, res: Response) {
        const roomId = parseInt(req.params.room_id)
        const locationSchema = Joi.object().keys({
            start: Joi.date().required()
        })

        const { error, value } = locationSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <LocationSchema>value

        let user = null
        const haveToken = req.header('Authorization')
        if (haveToken) {
            const payload = await TokenService.verifyToken(haveToken)
            const userRepository = getRepository(User)
            user = await userRepository.findOne(payload.sub)
        }
        const schedules = await LocationRepository.getLocationsByWeek(roomId, data, user)
        res.json({ success: true, schedules })
    },

    async getSchedules(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        let page = req.query.page.toString()
        console.log(page)
        //const schedules = await LocationRepository.getSchedules(page)
       // res.json({ success: true, data: schedules })
    },

    async getInstructorSchedules(req: ExtendedRequest, res: Response) {
        if (!req.instructor) throw new ErrorResponse(401, 15, "No autorizado")
        const locationSchema = Joi.object().keys({
            start: Joi.date().required()
        })

        const { error, value } = locationSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <LocationSchema>value


        const schedules = await LocationRepository.getInstructorSchedules(req.instructor, data)
        res.json({ success: true, data: schedules })
    }


}