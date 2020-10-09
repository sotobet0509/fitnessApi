import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { PurchaseRepository } from '../repositories/purchase'
import { ErrorResponse } from '../errors/ErrorResponse'
import { DataMissingError } from '../errors/DataMissingError'
import { Invoice, PurchaseData } from '../interfaces/purchase'
import { join } from 'path'

export const PurchaseController = {

    async buy(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const purchaseSchema = Joi.object().keys({
            bundles: Joi.array().items(
                Joi.number()
            ).required(),
            transactionId: Joi.string().required(),
        })
        const { error, value } = purchaseSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <PurchaseData>value
        const clientId = req.params.client_id
        await PurchaseRepository.buy(data, clientId)

        return res.json({
            success: true,
        })
    },
    async upgradeBundle(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        console.log('aiuda')
        const purchaseId = parseInt(req.params.purchase_id)
        const bundleId = parseInt(req.params.bundle_id)

        const isInvoice = Joi.object().keys({
            invoice: Joi.boolean().required()
        })
        console.log('llega hace el joi')
        const { error, value } = isInvoice.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <Invoice>value
        
        console.log('llega hasta antes del repo')
        await PurchaseRepository.upgradeBundle(purchaseId, bundleId, data)
        console.log('pasa del repo')
        return res.json({
            success: true
        })
    }
}