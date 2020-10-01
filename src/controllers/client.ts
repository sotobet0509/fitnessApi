import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { ClientRepository } from '../repositories/client'
import { ErrorResponse } from '../errors/ErrorResponse'
import { DataMissingError } from '../errors/DataMissingError'
import { CustomerData } from '../interfaces/auth'

export const ClientController = {

    async getAllClients(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const clients = await ClientRepository.getAllClients()
        res.json({ success: true, data: clients })
    },

    async getClient(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const clientId = req.params.client_id
        const client = await ClientRepository.getClient(clientId)
        res.json({ success: true, data: client })

    },

    async createClient(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const localLoginSchema = Joi.object().keys({
            email: Joi.string().required(),
            name: Joi.string().required(),
            lastname: Joi.string().required(),
        })
        const { error, value } = localLoginSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <CustomerData>value

        const client = await ClientRepository.createClient(data)

        return res.json({
            success: true,
            client
        })
    }
}