import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { User } from '../entities/Users'
import { CustomerData } from '../interfaces/auth'
import { Invoice, PurchaseData } from '../interfaces/purchase'
import { Purchase } from '../entities/Purchases'
import { Bundle } from '../entities/Bundles'
import { Transaction } from '../entities/Transactions'
import { Payment_method } from '../entities/Payment_methods'
import { format } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { invalid } from 'moment'

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
            const bundle = bundles[i]
            const purchase = new Purchase()
            purchase.User = client
            purchase.date = new Date()
            purchase.Payment_method = paymentMethod
            purchase.Bundle = bundle

            const _purchase = await getRepository(Purchase).save(purchase)

            const transaction = new Transaction()
            transaction.voucher = data.transactionId
            transaction.date = new Date()
            transaction.invoice = false
            transaction.total = bundle.price
            transaction.Purchase = _purchase
            await getRepository(Transaction).save(transaction)

        }
    },

    async upgradeBundle(purchaseId: number, bundleId: number,data: Invoice) {
        const purchase = await getRepository(Purchase).findOne(
            {
                where: {
                    id: purchaseId
                },
                relations: ['Bundle']
            }
        )
        if (!purchase) throw new ErrorResponse(404, 14, 'La compra no existe')

        const currentBundle = await getRepository(Bundle).findOne({
            where: {
                id: purchase.Bundle.id
            }
        })
        if (!currentBundle) throw new ErrorResponse(404, 14, 'El paquete actual no existe')
        if (currentBundle.name == 'Paquete Prueba')  throw new ErrorResponse(404, 14, 'El paquete prueba no puede ser modificado')
        const newBundle = await getRepository(Bundle).findOne({
            where: {
                id: bundleId
            }
        })
        if (!newBundle) throw new ErrorResponse(404, 14, 'El nuevo paquete no existe')
        if (currentBundle.id == newBundle.id) throw new ErrorResponse(404, 14, 'No se puede cambiar, es el mismo paquete')
        if (currentBundle.price > newBundle.price) throw new ErrorResponse(404, 14, 'No se puede realizar la compra, el paquete actual es mas grande')

        const transaction = new Transaction()
        transaction.voucher= currentBundle.name
        transaction.date = new Date()
        transaction.invoice = data.invoice
        transaction.total = newBundle.price - currentBundle.price
        transaction.Purchase = purchase

        await getRepository(Transaction).save(transaction)

        purchase.Bundle = newBundle
        await getRepository(Purchase).save(purchase)
    
    }
}

