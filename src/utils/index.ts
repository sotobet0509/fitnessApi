import * as moment from "moment"
import { getRepository } from "typeorm"
import { Alternate_users } from "../entities/alternateUsers"
import { Booking } from "../entities/Bookings"
import { Bundle } from "../entities/Bundles"
import { Folios } from "../entities/Folios"
import { Payment_method } from "../entities/Payment_methods"
import { Purchase } from "../entities/Purchases"
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
    for (var i in purchases) {

        const purchase = purchases[i]
        if(purchase.isCanceled) continue
        let contadorClasses = purchase.Bundle.classNumber + purchase.addedClasses
        let contadorPasses = purchase.Bundle.passes + purchase.addedPasses
  
        contadorClasses -= bookings.filter((b: Booking) => {
            let auxBooking = new Booking()
            auxBooking.fromPurchase = purchase
            return b.fromPurchase === auxBooking.fromPurchase && !b.isPass
        }).length

        contadorPasses -= bookings.filter((b: Booking) => {
            let auxBooking = new Booking()
            auxBooking.fromPurchase = purchase
            return b.fromPurchase === auxBooking.fromPurchase && b.isPass
        }).length

        results.push({
            purchase: purchase,
            pendingClasses: contadorClasses,
            pendingPasses: contadorPasses
        })
        if (contadorClasses == 0 && contadorPasses == 0) results.pop()
    }

    const orderedPurchases = orderPendingClassesByExpirationDay(results)

    for (var i in bookings) {
        let booking = bookings[i]
       // console.log(booking)

        // const validatePurchase = await getRepository(Purchase).findOne({
        //     where:{
        //         id: booking.fromPurchase
        //     }
        // })
        // if( validatePurchase && validatePurchase.isCanceled ) continue

        if (booking.fromPurchase == null) {
            for (var j in orderedPurchases) {
                let orderedPurchase = orderedPurchases[j]
                if (booking.isPass) {
                    if (orderedPurchase.pendingPasses > 0 && booking.isPass) {
                        orderedPurchase.pendingPasses -= 1
                        break
                    } else continue
                } else {
                    if (orderedPurchase.pendingClasses > 0 && !booking.isPass) {
                        orderedPurchase.pendingClasses -= 1
                        break
                    } else continue
                }
            }
        }else{
            const validatePurchase = await getRepository(Purchase).findOne({
                where:{
                    id: booking.fromPurchase
                }
            })
            if( validatePurchase && validatePurchase.isCanceled ) continue
        }
    }

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

export const createBundlePurchase = async (bundle: Bundle, user: User, paymentMethod: Payment_method, data: Voucher) => {
    if (bundle.isEspecial) {
        let purchase = new Purchase()
        purchase.User = user
        purchase.Bundle = bundle
        purchase.date = new Date()
        purchase.Payment_method = paymentMethod
        purchase.expirationDate = moment().add(bundle.expirationDays, 'days').toDate()

        await getRepository(Purchase).save(purchase)

        const transaction = new Transaction()
        transaction.voucher = data.voucher
        transaction.date = new Date()
        transaction.invoice = false
        transaction.total = bundle.price
        transaction.Purchase = purchase

        await getRepository(Transaction).save(transaction)

        const colaborador = await getRepository(Alternate_users).findOne({
            where: {
                id: bundle.altermateUserId
            }
        })
        const shortColaborador = colaborador.name.substr(0, 3).toUpperCase()
        let shortUuid = uuidv4().substr(0, 6)
        let folioSave = new Folios()
        folioSave.Alternate_users = colaborador
        folioSave.clientName = user.name + " " + user.lastname
        folioSave.folio = shortColaborador + "-" + shortUuid
        folioSave.expirationDate = moment().add(bundle.promotionExpirationDays, 'days').toDate()
        folioSave.purchase = purchase.id

        await getRepository(Folios).save(folioSave)
        
        const folio = await getRepository(Folios).findOne({
            where: {
                id: folioSave.id
            },
            relations: ["Alternate_users"]
        })

        return folio
    }


    let purchase = new Purchase()
    purchase.User = user
    purchase.Bundle = bundle
    purchase.date = new Date()
    purchase.Payment_method = paymentMethod
    purchase.expirationDate = moment().add(bundle.expirationDays, 'days').toDate()

    await getRepository(Purchase).save(purchase)

    const transaction = new Transaction()
    transaction.voucher = data.voucher
    transaction.date = new Date()
    transaction.invoice = false
    transaction.total = bundle.price
    transaction.Purchase = purchase

    await getRepository(Transaction).save(transaction)
} 