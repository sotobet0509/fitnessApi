import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { ErrorResponse } from '../errors/ErrorResponse'
import { BookingRepository } from '../repositories/booking'
import { DataMissingError } from '../errors/DataMissingError'
import { DeleteBooking } from '../interfaces/booking'

export const BookingController = {

    async deleteBooking(req: ExtendedRequest, res: Response) {
        const bookingId = parseInt(req.params.booking_id)

        await BookingRepository.deleteBooking(bookingId)
        res.json({ success: true })
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
    },

    async deleteBookingFromAdmin(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const bookingId = parseInt(req.params.booking_id)

        const deleteBooking = Joi.object().keys({
            discountClass: Joi.boolean().required()
        })
        const { error, value } = deleteBooking.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <DeleteBooking>value

        await BookingRepository.deleteBookingFromAdmin(bookingId, data)
        res.json({ success: true })
    },

    async searchBooking(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")

        const bookings = await BookingRepository.searchBooking(req.params.query, req.params.clientId)
        res.json({ success: true, bookings })
    },

    async getClientBookings(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const bookingId = parseInt(req.params.booking_id)

        let page = req.query.page.toString()

        const bookings = await BookingRepository.getClientBookings(page, req.params.clientId)
        res.json({ success: true, bookings })
    },
}