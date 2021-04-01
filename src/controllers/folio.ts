import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { FolioRepository } from '../repositories/folio'


export const FolioController = {
    async getFolios(req: ExtendedRequest, res: Response) {
        const colaboradorId = parseInt(req.alternateUsers.id)
        const folios = await FolioRepository.getFolios(colaboradorId)
        res.json({ success: true, folios })
    },

    async redeemFolio(req: ExtendedRequest, res: Response) {
        const folioId = parseInt(req.params.folio_id)
        await FolioRepository.redeemFolio(folioId)
        res.json({ success: true})
    }
}