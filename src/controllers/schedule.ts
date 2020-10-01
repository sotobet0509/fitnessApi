import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { ScheduleRepository } from '../repositories/schedule'
import { ErrorResponse } from '../errors/ErrorResponse'
import { ScheduleSchema } from '../interfaces/schedule'
import { DataMissingError } from '../errors/DataMissingError'


export const ScheduleController ={

    async getSchedule(req: ExtendedRequest, res: Response){
        const scheduleId = parseInt(req.params.scheduleId)
        const schedule = await ScheduleRepository.getSchedule(scheduleId)
        res.json({ success: true, data: schedule})
        
    },

    async booking(req: ExtendedRequest, res: Response){
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const scheduleId = parseInt(req.params.schedule_id)
        const seatId = parseInt(req.params.seat_id)
        const clientId = req.params.client_id

        await ScheduleRepository.setBooking(scheduleId, seatId, clientId)

        res.json({ success: true})
    },

    async createSchedule(req: ExtendedRequest, res: Response){
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const scheduleSchema = Joi.object().keys({
            date: Joi.date().required(),
            end: Joi.date().required(),
            start: Joi.date().required(),
            instructor_id: Joi.number().required(),
            roomsId: Joi.number().required()
        })
        const { error, value } = scheduleSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <ScheduleSchema>value

        await ScheduleRepository.createSchedule(data)
        res.json({ success: true})
    }



}