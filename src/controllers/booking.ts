import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { BundleRepository } from '../repositories/bundle'
import { ErrorResponse } from '../errors/ErrorResponse'
import { BookingRepository } from '../repositories/booking'

export const BookingController ={

    async deleteBooking(req: ExtendedRequest, res: Response){
        const bookingId = parseInt(req.params.booking_id)

        await BookingRepository.deleteBooking(bookingId)
        res.json({ success: true})
    },

    async getSeats(req: ExtendedRequest, res: Response) {
        const scheduleId = parseInt(req.params.schedule_id)
        const user = req.user
        if (!user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")

        const response = await BookingRepository.getSeats(scheduleId)
        res.json({
            success: true,
            data: response
        })
    }
}