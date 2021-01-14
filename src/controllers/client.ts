import { request, Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { ClientRepository } from '../repositories/client'
import { ErrorResponse } from '../errors/ErrorResponse'
import { DataMissingError } from '../errors/DataMissingError'
import { ClientId, CustomerData } from '../interfaces/auth'
import { ClientData } from '../interfaces/auth'


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
    },

    async updateClient(req: ExtendedRequest, res: Response){
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const userSchema = Joi.object().keys({
            id: Joi.string().required(),
            name: Joi.string(),
            lastname: Joi.string(),
            email: Joi.string(),
            password: Joi.string(),
            pictureUrl: Joi.string(),
            facebookId: Joi.string(),
            gooleId: Joi.string(),
            isAdmin: Joi.boolean(),
            createdAt: Joi.date()
        })
        const { error, value } = userSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <ClientData>value

        await ClientRepository.updateClient(data)
        res.json({ success: true})
    },


    async changeClientStatus(req: ExtendedRequest, res: Response){
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        
        const clientId = req.params.client_id

        await ClientRepository.changeClientStatus(clientId)
        res.json({ success: true})
    },

    async inviteClientToGroup(req: ExtendedRequest, res: Response){
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        
        const email = req.params.email

        const clientIdJoi = Joi.object().keys({
            client_id: Joi.string().required()
        })

        const { error, value } = clientIdJoi.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <ClientId>value

        const token = await ClientRepository.inviteClientToGroup(data.client_id, email)
        res.json({ success: true, data: token })
    }
}