import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { PurchaseRepository } from '../repositories/purchase'
import { ErrorResponse } from '../errors/ErrorResponse'
import { DataMissingError } from '../errors/DataMissingError'
import { Comments, extraPurchaseSchema, InitialzePurchase, Invoice, PurchaseData, Voucher } from '../interfaces/purchase'
import { URLSearchParams } from 'url'


const fetch = require('node-fetch')

export const PurchaseController = {

    async buy(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const purchaseSchema = Joi.object().keys({
            bundles: Joi.array().items(
                Joi.number()
            ).required(),
            transactionId: Joi.string().required(),
            comments: Joi.string(),
            discount: Joi.number(),
            paymentMethod: Joi.string().valid('efectivo', 'tarjeta').required(),
        })
        const { error, value } = purchaseSchema.validate(req.body)
        if (error) {
            throw new DataMissingError()
        }

        const data = <PurchaseData>value
        const clientId = req.params.client_id
        await PurchaseRepository.buy(data, clientId)

        return res.json({
            success: true,
        })
    },

    async upgradeBundle(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const purchaseId = parseInt(req.params.purchase_id)
        const bundleId = parseInt(req.params.bundle_id)

        const isInvoice = Joi.object().keys({
            invoice: Joi.boolean().required(),
            comment: Joi.string()
        })
        const { error, value } = isInvoice.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <Invoice>value

        await PurchaseRepository.upgradeBundle(purchaseId, bundleId, data)
        return res.json({
            success: true
        })
    },

    async buyExtra(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const extraPurchaseSchema = Joi.object().keys({
            addedClasses: Joi.number(),
            addedPasses: Joi.number()
        })
        const { error, value } = extraPurchaseSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <extraPurchaseSchema>value
        const clientId = req.params.client_id
        const purchaseId = parseInt(req.params.purchase_id)

        await PurchaseRepository.buyExtra(data, clientId, purchaseId)

        return res.json({
            success: true,
        })
    },

    async cancelPurchase(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")

        const purchaseId = parseInt(req.params.purchase_id)
        const comment = Joi.object().keys({
            comment: Joi.string()
        })
        const { error, value } = comment.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <Comments>value

        await PurchaseRepository.cancelPurchase(purchaseId, data)

        return res.json({
            success: true,
        })
    },

    async updateAll(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")

        await PurchaseRepository.updateAll()

        return res.json({
            success: true,
        })
    },

    async buyClient(req: ExtendedRequest, res: Response) {
        if (req.user.isAdmin) throw new ErrorResponse(401, 46, "No autorizado")
        const userId = req.user.id

        const operationId = req.params.operationId

        const folio = await PurchaseRepository.buyClient(userId, operationId)

        return res.json({
            success: true, folio
        })
    },

    async createSession(req: ExtendedRequest, res: Response) {
        const body = req.body
        const b = new URLSearchParams()
        for (var i in Object.keys(body)) {
            b.append(Object.keys(body)[i], body[Object.keys(body)[i]])
        }
        //b.append('apiPassword', 'fd29007ba13ab16e3fc16e1c9ef8c85d') // TEST
        b.append('apiPassword', '9e092c06e150c6cf046a5ee508d92375') // PROD
        b.append('apiUsername', 'merchant.1146286')
        b.append('merchant', '1146286')
        const response = await fetch('https://evopaymentsmexico.gateway.mastercard.com/api/nvp/version/57', {
            method: 'POST',
            body: b,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        })
        const responseText = await response.text()
        res.send(responseText)
    },

    async updateExpiarationDate(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 46, "No autorizado")
        await PurchaseRepository.updateExpirationDate()
        return res.json({
            success: true
        })
    },

    async inicializePurchase(req: ExtendedRequest, res: Response) {
        if (req.user.isAdmin) throw new ErrorResponse(401, 46, "No autorizado")

        const purchaseData = Joi.object().keys({
            bundleId: Joi.number().required(),
            operationIds: Joi.string().required()
        })
        const { error, value } = purchaseData.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <InitialzePurchase>value

        await PurchaseRepository.inicializePurchase(req.user, data)
        return res.json({
            success: true
        })
    },

    async getAllPurchases(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 46, "No autorizado")
        let page = req.query.page.toString()

        const purchases = await PurchaseRepository.getAllPurchases(page)
        return res.json({
            success: true,
            data: purchases
        })
    },

    async completePurchase(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 46, "No autorizado")

        await PurchaseRepository.completePurchase(parseInt(req.params.purchaseId))
        return res.json({
            success: true
        })
    },

    async setCancelStatus(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 46, "No autorizado")

        await PurchaseRepository.setCancelStatus(parseInt(req.params.purchaseId))
        return res.json({
            success: true
        })
    },

    async eraseOldPendingPurchases(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 46, "No autorizado")
        await PurchaseRepository.eraseOldPendingPurchases()
        return res.json({
            success: true
        })
    },

    async searchPurchase(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 46, "No autorizado")
       
        const purchases = await PurchaseRepository.searchPurchase(req.params.query)

        return res.json({
            success: true,
            purchases
        })
    },

    async searchClientPurchase(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 46, "No autorizado")
       
        const purchases = await PurchaseRepository.searchClientPurchase(req.params.query, req.params.clientId)

        return res.json({
            success: true,
            purchases
        })
    },

    async getClientPurchases(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 46, "No autorizado")
        let page = req.query.page.toString()

        const purchases = await PurchaseRepository.getClientPurchases(req.params.clientId, page)

        return res.json({
            success: true,
            purchases
        })
    },
}