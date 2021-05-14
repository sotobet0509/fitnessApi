import { getRepository, createQueryBuilder } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { User } from '../entities/Users'
import { Comments, extraPurchaseSchema, InitialzePurchase, Invoice, PurchaseData, Voucher } from '../interfaces/purchase'
import { Purchase, status } from '../entities/Purchases'
import { Bundle } from '../entities/Bundles'
import { Transaction } from '../entities/Transactions'
import { Payment_method, type } from '../entities/Payment_methods'
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
                    id: clientId,
                    isDeleted: false
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
                    type: data.paymentMethod
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
                    if (!client.groupName) {
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
                    if (!client.groupName) {
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
                    id: clientId,
                    isDeleted: false
                }
            }
        )
        if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')

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
            if (orderedPurchases.length > 0) {
                purchases[i].expirationDate = moment(orderedPurchases[orderedPurchases.length - 1].date).add(purchases[i].Bundle.expirationDays, "days").toDate()

                await getRepository(Purchase).save(purchases[i])
            }
        }
    },

    async buyClient(userId: string, operationId: string,) {
        const user = await getRepository(User).findOne({
            where: {
                id: userId,
                isDeleted: false
            }
        })
        if (!user) throw new ErrorResponse(404, 47, 'El usuario no existe')

        const purchase = await getRepository(Purchase).findOne({
            where: {
                operationIds: operationId,
                status: status.PENDING
            },
            relations: ['Bundle', 'User']
        })
        if (!purchase) throw new ErrorResponse(404, 47, 'La compra no existe o ya fue registrada')

        const bundle = await getRepository(Bundle).findOne({
            where: {
                id: purchase.Bundle.id
            }
        })
        if (!bundle) throw new ErrorResponse(404, 48, 'El paquete no existe')


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
                    if (!updateClient.groupName) {
                        updateClient.groupName = user.email
                    }
                    await clientRepository.save(updateClient)
                    return createBundlePurchase(purchase)
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
                    if (liderPurchases) {
                        orderedPurchases = orderLiderPurchasesByExpirationDay(liderPurchases.Purchase)
                        if (moment().diff(orderedPurchases[0].expirationDate, 'days') < 0) throw new ErrorResponse(404, 60, 'Usuario lider ya tiene paquete grupal')
                        else {
                            return createBundlePurchase(purchase)
                        }
                    }
                    return createBundlePurchase(purchase)
                }
            }
        } else {
            return createBundlePurchase(purchase)
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

    async inicializePurchase(client: User, data: InitialzePurchase) {
        const user = await getRepository(User).findOne({
            where: {
                id: client.id,
                isDeleted: false
            }
        })
        if (!user) throw new ErrorResponse(404, 14, 'El cliente no existe')


        const bundle = await getRepository(Bundle).findOne({
            where: {
                id: data.bundleId
            }
        })
        if (!bundle) throw new ErrorResponse(404, 14, 'El paquete no existe')

        const paymentMethod = await getRepository(Payment_method).findOne(
            {
                where: {
                    id: 0
                }
            }
        )

        let purchase = new Purchase()
        purchase.date = new Date()
        purchase.status = status.PENDING
        purchase.pendingAmount = bundle.price
        purchase.Bundle = bundle
        purchase.Payment_method = paymentMethod
        purchase.User = user
        purchase.operationIds = data.operationIds

        await getRepository(Purchase).save(purchase)
    },

    async getAllPurchases(page: string) {
        const pages = parseInt(page) - 1

        let purchases = await createQueryBuilder(Purchase)
            .leftJoinAndSelect("Purchase.User", "User")
            .leftJoinAndSelect("Purchase.Transaction", "Transaction")
            .leftJoinAndSelect("Purchase.Bundle", "Bundle")
            .select([
                "Purchase",
                "Transaction",
                "Bundle",
                "User.name",
                "User.lastname",
                "User.email"
            ])
            .orderBy("Purchase.date", "DESC")
            .skip(pages * 10)
            .take(10)
            .getMany();

        let pagesNumber = await createQueryBuilder(Purchase)
            .leftJoinAndSelect("Purchase.User", "User")
            .leftJoinAndSelect("Purchase.Transaction", "Transaction")
            .leftJoinAndSelect("Purchase.Bundle", "Bundle")
            .select([
                "Purchase.id"
            ])
            .orderBy("Purchase.date", "DESC")
            .getCount()

        if (!purchases) throw new ErrorResponse(404, 70, 'No hay compras registradas')
        return { purchases, pages: pagesNumber }
    },

    async completePurchase(purchaseId: number) {
        let purchase = await getRepository(Purchase).findOne({
            where: {
                id: purchaseId,
                status: status.PENDING
            },
            relations: ['Bundle']
        })
        if (!purchase) throw new ErrorResponse(404, 71, 'La compra no existe o no tiene status "Pendiente"')
        const bundle = await getRepository(Bundle).findOne({
            where: {
                id: purchase.Bundle.id
            }
        })
        if (!bundle) throw new ErrorResponse(404, 72, 'El paquete no existe')

        purchase.status = status.FINISHED
        purchase.expirationDate = moment().add(bundle.expirationDays, 'days').toDate()

        let transaction = new Transaction()
        transaction.voucher = purchase.operationIds
        transaction.date = new Date()
        transaction.Purchase = purchase
        transaction.total = purchase.pendingAmount
        transaction.invoice = false

        await getRepository(Purchase).save(purchase)
        await getRepository(Transaction).save(transaction)

    },

    async setCancelStatus(data: number) {
        const purchase = await getRepository(Purchase).findOne({
            where: {
                id: data,
                status: status.PENDING
            }
        })
        if (!purchase) throw new ErrorResponse(404, 71, 'La compra no existe o no tiene status "Pendiente"')

        purchase.status = status.CANCELED
        await getRepository(Purchase).save(purchase)
    },

    async eraseOldPendingPurchases() {
        const validateDate = moment().add(-30, "days")
        const oldPendingPurchases = await createQueryBuilder(Purchase)
            .where('Date(Purchase.date) <=:vDate', { vDate: validateDate.format('YYYY-MM-DD') })
            .andWhere('Purchase.status =:status', { status: "Pendiente" })
            .getMany();

        for (var i in oldPendingPurchases) {
            oldPendingPurchases[i].status = status.CANCELED
            await getRepository(Purchase).save(oldPendingPurchases[i])
        }
    },

    async searchPurchase(query: string) {
        const purchases = await createQueryBuilder(Purchase)
            .leftJoinAndSelect("Purchase.User", "User")
            .leftJoinAndSelect("Purchase.Transaction", "Transaction")
            .leftJoinAndSelect("Purchase.Bundle", "Bundle")
            .where('Purchase.operationIds like :query  or Purchase.date like :query or Purchase.status like :query or Purchase.pendingAmount like :query or Bundle.name like :query or User.name like :query or User.lastname like :query or User.email like :query', {
                query: '%' + query + '%',
            })
            .limit(10)
            .orderBy("Purchase.date", "DESC")
            .getMany()

        return purchases
    },

    async searchClientPurchase(query: string, clientId: string) {
        const purchases = await createQueryBuilder(Purchase)
            .leftJoinAndSelect("Purchase.User", "User")
            .leftJoinAndSelect("Purchase.Transaction", "Transaction")
            .leftJoinAndSelect("Purchase.Bundle", "Bundle")
            .leftJoinAndSelect("Purchase.Payment_method", "Payment_method")
            .where('Purchase.date like :query or Transaction.voucher like :query  or  Payment_method.type like :query or Transaction.total like :query or Bundle.name like :query or Purchase.expirationDate like :query', {
                query: '%' + query + '%',
            })
            .andWhere('User.id =:client_id', { client_id: clientId })
            .limit(10)
            .orderBy("Purchase.date", "DESC")
            .getMany()

        for (var i in purchases) {
            delete purchases[i].User
            delete purchases[i].Bundle.description
            delete purchases[i].Bundle.especialDescription
            delete purchases[i].Bundle.isDeleted
            delete purchases[i].Bundle.altermateUserId
            delete purchases[i].Bundle.isEspecial
            delete purchases[i].Bundle.isGroup
            delete purchases[i].Bundle.classNumber
            delete purchases[i].Bundle.isRecurrent
            delete purchases[i].Bundle.isUnlimited
            delete purchases[i].Bundle.price
            delete purchases[i].Bundle.passes
            delete purchases[i].Bundle.pictureUrl
            delete purchases[i].Bundle.max
            delete purchases[i].Bundle.memberLimit
            delete purchases[i].Bundle.promotionExpirationDays
            delete purchases[i].Bundle.offer
            delete purchases[i].Bundle.expirationDays
            delete purchases[i].addedClasses
            delete purchases[i].addedPasses
            delete purchases[i].pendingAmount
            delete purchases[i].operationIds
            delete purchases[i].Transaction.comments
            delete purchases[i].Transaction.invoice
        }
        return purchases
    },

    async getClientPurchases(clientId: string, page: string) {
        const pages = parseInt(page) - 1

        const purchases = await createQueryBuilder(Purchase)
            .leftJoinAndSelect("Purchase.User", "User")
            .leftJoinAndSelect("Purchase.Transaction", "Transaction")
            .leftJoinAndSelect("Purchase.Bundle", "Bundle")
            .leftJoinAndSelect("Purchase.Payment_method", "Payment_method")
            .andWhere('User.id =:client_id', { client_id: clientId })
            .skip(pages * 10)
            .take(10)
            .orderBy("Purchase.date", "DESC")
            .getMany()

        const pagesNumber = await createQueryBuilder(Purchase)
            .leftJoinAndSelect("Purchase.User", "User")
            .leftJoinAndSelect("Purchase.Transaction", "Transaction")
            .leftJoinAndSelect("Purchase.Bundle", "Bundle")
            .leftJoinAndSelect("Purchase.Payment_method", "Payment_method")
            .andWhere('User.id =:client_id', { client_id: clientId })
            .orderBy("Purchase.date", "DESC")
            .getCount()

        for (var i in purchases) {
            delete purchases[i].User
            delete purchases[i].Bundle.description
            delete purchases[i].Bundle.especialDescription
            delete purchases[i].Bundle.isDeleted
            delete purchases[i].Bundle.altermateUserId
            delete purchases[i].Bundle.isEspecial
            delete purchases[i].Bundle.isGroup
            delete purchases[i].Bundle.classNumber
            delete purchases[i].Bundle.isRecurrent
            delete purchases[i].Bundle.isUnlimited
            delete purchases[i].Bundle.passes
            delete purchases[i].Bundle.pictureUrl
            delete purchases[i].Bundle.max
            delete purchases[i].Bundle.memberLimit
            delete purchases[i].Bundle.promotionExpirationDays
            delete purchases[i].Bundle.offer
            delete purchases[i].Bundle.expirationDays
            delete purchases[i].addedClasses
            delete purchases[i].addedPasses
            delete purchases[i].pendingAmount
            delete purchases[i].operationIds
            delete purchases[i].Transaction.comments
            delete purchases[i].Transaction.invoice
        }
        return { purchases, pagesNumber }
    },
}


