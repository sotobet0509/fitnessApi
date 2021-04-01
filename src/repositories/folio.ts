import { getRepository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Folios } from '../entities/Folios'
import * as moment from 'moment'


export const FolioRepository = {
    async getFolios(colaboradorId: number) {
        const folios = await getRepository(Folios).find({
            where: {
                Alternate_users: colaboradorId
            }
        })
        if (!folios) throw new ErrorResponse(404, 50, 'No hay folios registrados')
        return folios
    },

    async redeemFolio(folioId: number) {
        const folio = await getRepository(Folios).findOne({
            where: {
                id: folioId
            }
        })
        if (!folio) throw new ErrorResponse(404, 51, 'El folio no existe')
        if (!folio.isAviable) throw new ErrorResponse(404, 52, 'El folio ya fue cobrado')
        const currentDate = moment()

        if (currentDate.isSameOrBefore(folio.expirationDate)) {
            folio.isAviable = false
            folio.redeemAt = new Date
            await getRepository(Folios).save(folio)
        }else throw new ErrorResponse(404, 53, 'El folio ha expirado')


    }
}