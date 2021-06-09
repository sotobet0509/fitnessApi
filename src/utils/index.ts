import * as moment from "moment"
import { getRepository } from "typeorm"
import { Alternate_users } from "../entities/alternateUsers"
import { Booking } from "../entities/Bookings"
import { Bundle } from "../entities/Bundles"
import { Folios } from "../entities/Folios"
import { Payment_method } from "../entities/Payment_methods"
import { Purchase, status } from "../entities/Purchases"
import { Transaction } from "../entities/Transactions"
import { User } from "../entities/Users"
import { pendingClasses, Voucher } from "../interfaces/purchase"
import { v4 as uuidv4 } from 'uuid'


export const orderByExpirationDay = (purchases: Purchase[]): Purchase[] => {
    let orderedPurchases = []

    orderedPurchases = purchases.sort((a: Purchase, b: Purchase) => {
        let date = moment(a.expirationDate)
        let date2 = moment(b.expirationDate)
        if (date.isBefore(date2)) return -1
        if (date.isAfter(date2)) return 1
        return 0
    })

    return orderedPurchases
}

export const getPendingClasses = async (purchases: Purchase[], bookings: Booking[]): Promise<pendingClasses[]> => {
    let results: pendingClasses[] = []
    const restBooking = bookings
    for (var i in purchases) {
        // por cada compra se buscarán los bookings que le correspondan
        // excepto si está cancelado
        const purchase = purchases[i]
        if (purchase.isCanceled) continue
        let contadorClasses = purchase.Bundle.classNumber + purchase.addedClasses
        let contadorPasses = purchase.Bundle.passes + purchase.addedPasses

        let bss = []
        for (var j in restBooking) {
            const b = restBooking[j]
            /*let auxBooking = new Booking()
            auxBooking.fromPurchase = purchase
            const booking = await getRepository(Booking).findOne({
                where: {
                    id: b.id
                },
                relations: ['fromPurchase']
            })*/
            if (b.fromPurchase && purchase.id === b.fromPurchase.id && !b.isPass) {
                bss.push(b)
            }
        }
        contadorClasses -= bss.length
        let bsp = []
        for (var j in restBooking) {
            const b = restBooking[j]
            /*let auxBooking = new Booking()
            auxBooking.fromPurchase = purchase
            const booking = await getRepository(Booking).findOne({
                where: {
                    id: b.id
                },
                relations: ['fromPurchase']
            })*/
            if (b.fromPurchase && purchase.id === b.fromPurchase.id && b.isPass) {
                bsp.push(b)
            }
        }

        contadorPasses -= bsp.length
        
        results.push({
            purchase: purchase,
            pendingClasses: contadorClasses,
            pendingPasses: contadorPasses
        })
        if (contadorClasses <= 0 && contadorPasses <= 0) results.pop()
    }
    const orderedPurchases = orderPendingClassesByExpirationDay(results)
    return orderedPurchases
}


export const orderPendingClassesByExpirationDay = (purchases: pendingClasses[]): pendingClasses[] => {
    let orderedPurchases = []

    orderedPurchases = purchases.sort((a: pendingClasses, b: pendingClasses) => {
        let date = moment(a.purchase.expirationDate)
        let date2 = moment(b.purchase.expirationDate)
        if (date.isBefore(date2)) return -1
        if (date.isAfter(date2)) return 1
        return 0
    })

    return orderedPurchases
}

export const orderLiderPurchasesByExpirationDay = (purchases: Purchase[]): Purchase[] => {
    let orderedPurchases = []

    orderedPurchases = purchases.sort((a: Purchase, b: Purchase) => {
        let date = moment(a.expirationDate)
        let date2 = moment(b.expirationDate)
        if (date.isBefore(date2)) return 1
        if (date.isAfter(date2)) return -1
        return 0
    })

    return orderedPurchases
}

export const createBundlePurchase = async (data: Purchase) => {

    if (data.Bundle.isEspecial) {
        /*let purchase = new Purchase()
        purchase.User = user
        purchase.Bundle = bundle
        purchase.date = new Date()
        purchase.Payment_method = paymentMethod
        purchase.expirationDate = moment().add(bundle.expirationDays, 'days').toDate()
        */
        data.status = status.FINISHED
        data.expirationDate = moment().add(data.Bundle.expirationDays, 'days').toDate()
        await getRepository(Purchase).save(data)

        const transaction = new Transaction()
        transaction.voucher = data.operationIds
        transaction.date = new Date()
        transaction.invoice = false
        transaction.total = data.pendingAmount
        transaction.Purchase = data

        await getRepository(Transaction).save(transaction)

        const colaborador = await getRepository(Alternate_users).findOne({
            where: {
                id: data.Bundle.altermateUserId
            }
        })
        const shortColaborador = colaborador.name.substr(0, 3).toUpperCase()
        let shortUuid = uuidv4().substr(0, 6)
        let folioSave = new Folios()
        folioSave.Alternate_users = colaborador
        folioSave.clientName = data.User.name + " " + data.User.lastname
        folioSave.folio = shortColaborador + "-" + shortUuid
        folioSave.expirationDate = moment().add(data.Bundle.promotionExpirationDays, 'days').toDate()
        folioSave.purchase = data.id

        await getRepository(Folios).save(folioSave)

        const folio = await getRepository(Folios).findOne({
            where: {
                id: folioSave.id
            },
            relations: ["Alternate_users"]
        })

        return folio
    }


    /*let purchase = new Purchase()
    purchase.User = user
    purchase.Bundle = bundle
    purchase.date = new Date()
    purchase.Payment_method = paymentMethod
    purchase.expirationDate = moment().add(bundle.expirationDays, 'days').toDate()
    */
    data.status = status.FINISHED
    data.expirationDate = moment().add(data.Bundle.expirationDays, 'days').toDate()

    await getRepository(Purchase).save(data)

    const transaction = new Transaction()
    transaction.voucher = data.operationIds
    transaction.date = new Date()
    transaction.invoice = false
    transaction.total = data.pendingAmount
    transaction.Purchase = data
    await getRepository(Transaction).save(transaction)
} 

export function replaceSpecialCharacters(name: string){  
    let name2 =  name.replace( /[^a-zA-Z0-9.]/g, '')
    return name2
}