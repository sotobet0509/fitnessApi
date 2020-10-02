import { Booking } from './../entities/Bookings';
import { Purchase } from './../entities/Purchases';
import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { User } from '../entities/Users'
import { CustomerData } from '../interfaces/auth'
import * as moment from 'moment'

export const ClientRepository = {
    async getAllClients(){
        const clients = await getRepository(User).find({
            where:{
                isAdmin: false
            }
        })
        let data = []
        for (var i in clients) {
            const client = clients[i]
            const purchases = await getRepository(Purchase).find({
                where: {
                    User: client
                },
                relations: ['Bundle']
            })
            const bookings = await getRepository(Booking).find({
                where: {
                    User: client
                }
            })
            let classes = 0
            for (var j in purchases) {
                const purchase = purchases[j]
                const bundle = purchase.Bundle
                if (moment().diff(purchase.date, 'days') <= bundle.expirationDays) {
                    classes = classes + bundle.classNumber
                }
            }
            const taken = bookings.length
            let pending = classes - taken
            if (pending < 0) {
                pending = 0
            }
            delete client.password
            data.push({
                client,
                pending,
                taken
            })
        }
        return data

    },
    
    async getClient(clientId: string){
        const client = await getRepository(User).findOne({
            where: {
                id: clientId
            }
        })
        if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')
        delete client.password
        return client
    },

    async createClient(data: CustomerData){
        const clientRepository = getRepository(User)
        //Revisar si existe ese email
        const exists = await clientRepository.findOne({
          where: {
            email: data.email,
          },
        })
    
        if (exists) throw new ErrorResponse(403, 6, 'Email already registered')
    
        let client = new User()
        client.email = data.email
        client.name = data.name
        client.lastname = data.lastname
      
        //Save
        client = await clientRepository.save(client)
    
        //await sendActivationUrl(client.email, client.tempToken)
        return client
    } 

}