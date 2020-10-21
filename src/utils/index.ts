import * as moment from "moment"
import { Booking } from "../entities/Bookings"
import { Purchase } from "../entities/Purchases"
import { pendingClasses } from "../interfaces/purchase"


export const orderByExpirationDay = (purchases: Purchase[]): Purchase[] => {
    let orderedPurchases = []

    orderedPurchases = purchases.sort((a: Purchase, b: Purchase) => {
        let date = moment(a.date)
        let date2 = moment(b.date)
        let dayExpiration = date.add(a.Bundle.expirationDays, "days")
        let dayExpiration2 = date2.add(b.Bundle.expirationDays, "days")
        if (dayExpiration.isBefore(dayExpiration2)) return -1
        if (dayExpiration.isAfter(dayExpiration2)) return 1
        return 0
    })

    return orderedPurchases
}

export const getPendingClasses = (purchases: Purchase[], bookings: Booking[]): pendingClasses[] => {
    let results: pendingClasses[] = []
    for (var i in purchases) {

        const purchase = purchases[i]

        let contadorClasses = purchase.Bundle.classNumber + purchase.addedClasses
        let contadorPasses = purchase.Bundle.passes + purchase.addedPasses
  
        contadorClasses -= bookings.filter((b: Booking) => {
            return b.fromPurchase === purchase.id && !b.isPass
        }).length

        contadorPasses -= bookings.filter((b: Booking) => {
            return b.fromPurchase === purchase.id && b.isPass
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
        }
    }

    return orderedPurchases
}


export const orderPendingClassesByExpirationDay = (purchases: pendingClasses[]): pendingClasses[] => {
    let orderedPurchases = []

    orderedPurchases = purchases.sort((a: pendingClasses, b: pendingClasses) => {
        let date = moment(a.purchase.date)
        let date2 = moment(b.purchase.date)
        let dayExpiration = date.add(a.purchase.Bundle.expirationDays, "days")
        let dayExpiration2 = date2.add(b.purchase.Bundle.expirationDays, "days")
        if (dayExpiration.isBefore(dayExpiration2)) return -1
        if (dayExpiration.isAfter(dayExpiration2)) return 1
        return 0
    })

    return orderedPurchases
} 