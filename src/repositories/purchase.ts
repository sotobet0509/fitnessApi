import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { User } from '../entities/Users'
import { CustomerData } from '../interfaces/auth'
import { PurchaseData } from '../interfaces/purchase'
import { Purchase } from '../entities/Purchases'
import { Bundle } from '../entities/Bundles'
import { Transaction } from '../entities/Transactions'
import { Payment_method } from '../entities/Payment_methods'
import { format } from 'path'

export const PurchaseRepository = {
    async buy(data: PurchaseData, clientId: string){
        const client = await getRepository(User).findOne(
            {
                where:{
                    id: clientId
                }
            }
        )
        if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')
        
        let bundles = []
        for(var i in data.bundles) {
            const id = data.bundles[i]
            const bundle = await getRepository(Bundle).findOne({
                where:{
                    id: id
                }
            })
            if(!bundle) throw new ErrorResponse(404, 14, 'El paquete no existe')
            bundles.push(bundle)
        }

        const paymentMethod = await getRepository(Payment_method).findOne(
            {
                where:{
                    id: 0
                }
            }
        )
        if (!paymentMethod) throw new ErrorResponse(404, 14, 'El metodo de pago no existe (admin)')

        for(var i in bundles ){
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
    } 

}