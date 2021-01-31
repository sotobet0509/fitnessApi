import { getRepository, getConnection, Repository, createQueryBuilder } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { User } from '../entities/Users'
import { Comments, extraPurchaseSchema, Invoice, PurchaseData, Voucher } from '../interfaces/purchase'
import { Purchase } from '../entities/Purchases'
import { Bundle } from '../entities/Bundles'
import { Transaction } from '../entities/Transactions'
import { Payment_method } from '../entities/Payment_methods'
import { createBundlePurchase, getPendingClasses, orderLiderPurchasesByExpirationDay } from '../utils'
import { Booking } from '../entities/Bookings'
import * as moment from "moment"
import { Folios } from '../entities/Folios'
import { Alternate_users } from '../entities/alternateUsers'
import { v4 as uuidv4 } from 'uuid'

export const PurchaseRepository = {
    async buy(data: PurchaseData, clientId: string) {
        const client = await getRepository(User).findOne(
            {
                where: {
                    id: clientId
                }
            }
        )
        if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')

        let bundles = []
        for (var i in data.bundles) {
            const id = data.bundles[i]
            const bundle = await getRepository(Bundle).findOne({
                where: {
                    id: id
                }
            })
            if (!bundle) throw new ErrorResponse(404, 14, 'El paquete no existe')
            bundles.push(bundle)
        }

        const paymentMethod = await getRepository(Payment_method).findOne(
            {
                where: {
                    id: 0
                }
            }
        )
        if (!paymentMethod) throw new ErrorResponse(404, 14, 'El metodo de pago no existe (admin)')

        for (var i in bundles) {
            if (bundles[i].isEspecial) {
                const bundle = bundles[i]
                const purchase = new Purchase()
                purchase.User = client
                purchase.date = new Date()
                purchase.Payment_method = paymentMethod
                purchase.Bundle = bundle
                purchase.expirationDate = moment().add(bundle.expirationDays, 'days').toDate()

                if (bundle.isGroup) {
                    client.changed = 1
                    client.isLeader = true
                    if(!client.groupName){
                        client.groupName = client.email
                    }
                    await getRepository(User).save(client)

                    let members = await getRepository(User).find({
                        where: {
                            fromGroup: client.id
                        }
                    })
                    if (members) {
                        for (var i in members) {
                            members[i].fromGroup = null
                            await getRepository(User).save(members[i])
                        }
                    }
                    
                }
                const _purchase = await getRepository(Purchase).save(purchase)

                const transaction = new Transaction()
                transaction.voucher = data.transactionId
                transaction.date = new Date()
                transaction.invoice = false
                if (data.discount) {
                    transaction.total = bundle.price * (1 - data.discount)
                } else {
                    transaction.total = bundle.price
                }
                transaction.Purchase = _purchase
                if (data.comments) transaction.comments = data.comments

                await getRepository(Transaction).save(transaction)

                const colaborador = await getRepository(Alternate_users).findOne({
                    where: {
                        id: bundle.altermateUserId
                    }
                })
                const shortColaborador = colaborador.name.substr(0, 3).toUpperCase()
                let shortUuid = uuidv4().substr(0, 6)

                let folio = new Folios()
                folio.Alternate_users = colaborador
                folio.clientName = client.name + " " + client.lastname
                folio.folio = shortColaborador + "-" + shortUuid
                folio.expirationDate = moment().add(bundle.promotionExpirationDays, 'days').toDate()
                folio.purchase = purchase.id

                await getRepository(Folios).save(folio)

            } else {

                const bundle = bundles[i]
                const purchase = new Purchase()
                purchase.User = client
                purchase.date = new Date()
                purchase.Payment_method = paymentMethod
                purchase.Bundle = bundle
                purchase.expirationDate = moment().add(bundle.expirationDays, 'days').toDate()

                if (bundle.isGroup) {
                    client.changed = 1
                    client.isLeader = true
                    if(!client.groupName){
                        client.groupName = client.email
                    }
                    await getRepository(User).save(client)

                    let members = await getRepository(User).find({
                        where: {
                            fromGroup: client.id
                        }
                    })
                    if (members) {
                        for (var i in members) {
                            members[i].fromGroup = null
                            await getRepository(User).save(members[i])
                        }
                    }
                }
                const _purchase = await getRepository(Purchase).save(purchase)

                const transaction = new Transaction()
                transaction.voucher = data.transactionId
                transaction.date = new Date()
                transaction.invoice = false
                if (data.discount) {
                    transaction.total = bundle.price * (1 - data.discount)
                } else {
                    transaction.total = bundle.price
                }
                transaction.Purchase = _purchase
                if (data.comments) transaction.comments = data.comments

                await getRepository(Transaction).save(transaction)
            }

        }
    },

    async upgradeBundle(purchaseId: number, bundleId: number, data: Invoice) {
        const purchase = await getRepository(Purchase).findOne(
            {
                where: {
                    id: purchaseId
                },
                relations: ['Bundle', 'User']
            }
        )
        if (!purchase) throw new ErrorResponse(404, 14, 'La compra no existe')

        const currentBundle = await getRepository(Bundle).findOne({
            where: {
                id: purchase.Bundle.id
            }
        })
        if (!currentBundle) throw new ErrorResponse(404, 14, 'El paquete actual no existe')
        if (currentBundle.name == 'Paquete Prueba') throw new ErrorResponse(404, 14, 'El paquete prueba no puede ser modificado')
        const newBundle = await getRepository(Bundle).findOne({
            where: {
                id: bundleId
            }
        })
        if (!newBundle) throw new ErrorResponse(404, 14, 'El nuevo paquete no existe')
        if (newBundle.name == 'Paquete Prueba') throw new ErrorResponse(404, 42, 'No se puede cambiar a paquete prueba')
        if (currentBundle.id == newBundle.id) throw new ErrorResponse(404, 14, 'No se puede cambiar, es el mismo paquete')

        let transaction = new Transaction()
        if (currentBundle.price < newBundle.price) {
            transaction.voucher = "Pago Complementario"
            transaction.date = new Date()
            transaction.invoice = data.invoice
            transaction.total = newBundle.price - currentBundle.price
            transaction.Purchase = purchase
            if (data.comment) transaction.comments = data.comment
            await getRepository(Transaction).save(transaction)

            purchase.Bundle = newBundle
            purchase.expirationDate = moment().add(newBundle.expirationDays, "days").toDate()
            await getRepository(Purchase).save(purchase)
        } else {
            //validar las compras y passes correspondientes al paquete
            const allPurchases = await getRepository(Purchase).find(
                {
                    where: {
                        User: purchase.User
                    },
                    relations: ['Bundle', 'User']
                }
            )
            const allBookings = await getRepository(Booking).find({
                where: {
                    User: purchase.User
                }
            })



            const hasClasses = await getPendingClasses(allPurchases, allBookings)

            const pending = hasClasses.find(x => x.purchase.id == purchase.id)

            //console.log(currentBundle.classNumber - pending.pendingClasses, (newBundle.classNumber))

            if (currentBundle.classNumber - pending.pendingClasses < (newBundle.classNumber)) {
                transaction.voucher = "Devolución"
                transaction.date = new Date()
                transaction.invoice = data.invoice
                transaction.total = newBundle.price - currentBundle.price
                transaction.Purchase = purchase
                if (data.comment) transaction.comments = data.comment
                await getRepository(Transaction).save(transaction)

                purchase.Bundle = newBundle
                purchase.expirationDate = moment().add(newBundle.expirationDays, "days").toDate()
                await getRepository(Purchase).save(purchase)
            } else throw new ErrorResponse(404, 14, 'El usuario ha tomado mas clases de las permitdas para el cambio')
        }
    },


    async buyExtra(data: extraPurchaseSchema, clientId: string, purchaseId: number) {
        const client = await getRepository(User).findOne(
            {
                where: {
                    id: clientId
                }
            }
        )
        if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')

        //console.log(purchaseId)
        let purchase = await getRepository(Purchase).findOne(
            {
                where: {
                    id: purchaseId
                }
            }
        )
        if (!purchase) throw new ErrorResponse(404, 41, 'La compra no existe')

        if (data.addedClasses) purchase.addedClasses += data.addedClasses
        if (data.addedPasses) purchase.addedPasses += data.addedPasses


        await getRepository(Purchase).save(purchase)


    },

    async cancelPurchase(purchaseId: number, data: Comments) {
        const purchase = await getRepository(Purchase).findOne({
            where: {
                id: purchaseId
            },
            relations: ["User"]

        })
        if (!purchase) throw new ErrorResponse(404, 44, 'La compra no existe')

        const bookings = await getRepository(Booking).find({
            where: {
                User: purchase.User,
                fromPurchase: purchaseId
            }
        })

        for (var i in bookings) {
            await getRepository(Booking).delete(bookings[i].id)
        }

        const transactions = await getRepository(Transaction).find({
            where: {
                Purchase: purchase
            }
        })


        let amount = 0
        for (var i in transactions) {
            amount += transactions[i].total
        }

        let newTransaction = new Transaction()
        newTransaction.voucher = "Cancelación"
        newTransaction.date = new Date()
        newTransaction.invoice = false
        newTransaction.total = amount * (-1)
        newTransaction.Purchase = purchase
        if (data.comment) newTransaction.comments = data.comment

        await getRepository(Transaction).save(newTransaction)
        purchase.isCanceled = true
        await getRepository(Purchase).save(purchase)

    },

    async updateAll() {
        let purchases = await getRepository(Purchase).find({
            relations: ['Transaction', 'Bundle']
        })

        for (var i in purchases) {

            let transactions = await getRepository(Transaction).find({
                where: {
                    Purchase: purchases[i]
                }
            })

            let orderedPurchases: Transaction[]
            orderedPurchases = transactions.sort((a: Transaction, b: Transaction) => {
                let date = moment(a.date)
                let date2 = moment(b.date)
                if (date.isBefore(date2)) return -1
                if (date.isAfter(date2)) return 1
                return 0
            })
            //console.log(orderedPurchases)
            if (orderedPurchases.length > 0) {
                purchases[i].expirationDate = moment(orderedPurchases[orderedPurchases.length - 1].date).add(purchases[i].Bundle.expirationDays, "days").toDate()

                await getRepository(Purchase).save(purchases[i])
            }
        }
    },

    async buyClient(userId: string, bundleId: number, data: Voucher) {
        const user = await getRepository(User).findOne({
            where: {
                id: userId
            }
        })
        if (!user) throw new ErrorResponse(404, 47, 'El usuario no existe')

        const bundle = await getRepository(Bundle).findOne({
            where: {
                id: bundleId
            }
        })
        if (!bundle) throw new ErrorResponse(404, 48, 'El paquete no existe')

        const paymentMethod = await getRepository(Payment_method).findOne(
            {
                where: {
                    id: 0
                }
            }
        )
        if (!paymentMethod) throw new ErrorResponse(404, 14, 'El metodo de pago no existe')

        if (bundle.isGroup) {
            if (user.fromGroup) throw new ErrorResponse(404, 58, 'Usuario de tipo miembro')
            else {
                if (!user.isLeader) {
                    const clientRepository = getRepository(User)
                    let updateClient = await getRepository(User).findOne({
                        where: {
                            id: user.id
                        }
                    })

                    updateClient.changed = 1
                    updateClient.isLeader = true
                    if(!updateClient.groupName){
                        updateClient.groupName = user.email
                    }
                    await clientRepository.save(updateClient)
                    return createBundlePurchase(bundle, user, paymentMethod, data)
                }
                else {
                    let updateClient = await getRepository(User).findOne({
                        where: {
                            id: user.id
                        }
                    })

                    updateClient.changed = 1
                    await getRepository(User).save(updateClient)
                    let members = await getRepository(User).find({
                        where: {
                            fromGroup: user.id
                        }
                    })
                    if (members) {
                        for (var i in members) {
                            members[i].fromGroup = null
                            await getRepository(User).save(members[i])
                        }

                    }


                    const liderPurchases = await createQueryBuilder(User)
                        .innerJoinAndSelect('User.Purchase', 'Purchase')
                        .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
                        .where('Bundle.isGroup=:isGroup', { isGroup: true })
                        .andWhere('Purchase.users_id=:idUser', { idUser: user.id })
                        .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
                        .getOne();
                    let orderedPurchases
                    //console.log(liderPurchases)
                    if (liderPurchases) {
                        orderedPurchases = orderLiderPurchasesByExpirationDay(liderPurchases.Purchase)
                        //console.log(moment().diff(orderedPurchases[0].expirationDate, 'days') )
                        if (moment().diff(orderedPurchases[0].expirationDate, 'days') < 0) throw new ErrorResponse(404, 60, 'Usuario lider ya tiene paquete grupal')
                        else {
                            return createBundlePurchase(bundle, user, paymentMethod, data)
                        }
                    }
                    return createBundlePurchase(bundle, user, paymentMethod, data)
                }
            }
        } else {
            return createBundlePurchase(bundle, user, paymentMethod, data)
        }

    },
    async updateExpirationDate() {
        const purchases = await getRepository(Purchase).find()
        const date = moment()
        let purchase = new Purchase()
        for (var i in purchases) {
            if (moment(purchases[i].expirationDate).isAfter(date)) {
                purchase = purchases[i]
                purchase.expirationDate = moment(purchase.expirationDate).add(23, 'days').toDate()
                await getRepository(Purchase).save(purchase)
            }
        }

    },
}

