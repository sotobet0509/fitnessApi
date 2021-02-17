import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { ScheduleRepository } from '../repositories/schedule'
import { ErrorResponse } from '../errors/ErrorResponse'
import { ScheduleIsPass, ScheduleSchema, ScheduleClientId } from '../interfaces/schedule'
import { DataMissingError } from '../errors/DataMissingError'
import { getRepository } from 'typeorm'
import { BookingRepository } from '../repositories/booking'


export const ScheduleController = {

    async getSchedule(req: ExtendedRequest, res: Response) {
        const scheduleId = parseInt(req.params.scheduleId)
        const schedule = await ScheduleRepository.getSchedule(scheduleId)
        res.json({ success: true, data: schedule })

    },

    async booking(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const scheduleId = parseInt(req.params.schedule_id)
        const seatId = parseInt(req.params.seat_id)
        const clientId = req.params.client_id

        const scheduleSchema = Joi.object().keys({
            isPass: Joi.boolean().required()
        })
        const { error, value } = scheduleSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <ScheduleIsPass>value

        await ScheduleRepository.setBooking(scheduleId, seatId, clientId, data.isPass)

        res.json({ success: true })
    },

    async bookingClient(req: ExtendedRequest, res: Response) {
        if (req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const scheduleId = parseInt(req.params.schedule_id)
        const seatId = parseInt(req.params.seat_id)
        const clientId = req.user.id


        const scheduleSchema = Joi.object().keys({
            isPass: Joi.boolean().required()
        })
        const { error, value } = scheduleSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <ScheduleIsPass>value

        const passes = await ScheduleRepository.setBooking(scheduleId, seatId, clientId, data.isPass)

        res.json({ success: true, passes })
    },

    async bookingClientGroupByAdmin(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const scheduleId = parseInt(req.params.schedule_id)
        const seatId = parseInt(req.params.seat_id)

        const clientIdJoi = Joi.object().keys({
            client_id: Joi.string().required(),
            isPass: Joi.boolean().required()
        })

        const { error, value } = clientIdJoi.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <ScheduleClientId>value

        const passes = await ScheduleRepository.setBookingGroupByAdmin(scheduleId, seatId, data.client_id, data.isPass)

        res.json({ success: true, passes })
    },

    async bookingClientGroup(req: ExtendedRequest, res: Response) {
        const scheduleId = parseInt(req.params.schedule_id)
        const seatId = parseInt(req.params.seat_id)
        const clientId = req.params.client_id
        const user = req.user

        const scheduleSchema = Joi.object().keys({
            isPass: Joi.boolean().required()
        })
        const { error, value } = scheduleSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <ScheduleIsPass>value

        const passes = await ScheduleRepository.setBookingGroup(scheduleId, seatId, clientId, data.isPass, user)

        res.json({ success: true, passes })
    },

    async createSchedule(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const scheduleSchema = Joi.object().keys({
            date: Joi.date().required(),
            end: Joi.date().required(),
            start: Joi.date().required(),
            instructor_id: Joi.number().required(),
            roomsId: Joi.number().required(),
            theme: Joi.string(),
            isPrivate: Joi.boolean()
        })
        const { error, value } = scheduleSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <ScheduleSchema>value
        //console.log(data)
        await ScheduleRepository.createSchedule(data)
        res.json({ success: true })
    },

    async updateSchedule(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const scheduleSchema = Joi.object().keys({
            id: Joi.number().required(),
            date: Joi.date(),
            end: Joi.date(),
            start: Joi.date(),
            instructor_id: Joi.number(),
            roomsId: Joi.number(),
            sendEmail: Joi.boolean().required(),
            deleteBookings: Joi.boolean().required(),
            theme: Joi.string(),
            isPrivate: Joi.boolean()
        })
        const { error, value } = scheduleSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <ScheduleSchema>value

        await ScheduleRepository.updateSchedule(data)

        res.json({ success: true })
    },

    async deleteSchedule(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")

        const scheduleId = parseInt(req.params.schedule_id)

        await ScheduleRepository.deleteSchedule(scheduleId)
        res.json({ success: true })
    },

    async setAssistance(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const bookingId = parseInt(req.params.booking_id)
        await ScheduleRepository.setAssistance(bookingId)
        res.json({ success: true })
    }

}