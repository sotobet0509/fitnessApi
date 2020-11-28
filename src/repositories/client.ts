import { Booking } from './../entities/Bookings';
import { Purchase } from './../entities/Purchases';
import { getRepository, getConnection, Repository, Between } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { User } from '../entities/Users'
import { ClientData, CustomerData } from '../interfaces/auth'
import { PasswordService } from '../services/password'
import * as moment from 'moment'
import { getPendingClasses } from '../utils';
import { pendingClasses } from '../interfaces/purchase';
import { sendActivationUrl } from '../services/mail';
import { Bundle } from '../entities/Bundles';

export const ClientRepository = {
    async getAllClients() {
        const clients = await getRepository(User).find({
            where: {
                isAdmin: false
            },
            relations: ['Booking', 'Booking.Schedule', 'Purchase', 'Purchase.Bundle'],
            // take: 10,
            //skip: 3
        })
        let data = []
        let nextExpirationDate: Date
        for (var i in clients) {
            const client = clients[i]

            /* const purchases = await getRepository(Purchase).find({
                 where: {
                     User: client
                 },
                 relations: ['Bundle', 'Transaction']
             })
             const bookings = await getRepository(Booking).find({
                 where: {
                     User: client
                 }
             })*/



            const bookingsNoPasses = await getRepository(Booking).find({
                where: {
                    User: client,
                    isPass: false
                }
            })

            const passes = await getRepository(Booking).find({
                where: {
                    User: client,
                    isPass: true
                }
            })

            let classes: pendingClasses[]
            classes = await getPendingClasses(client.Purchase, client.Booking)
            delete client.password
            classes = classes.filter((p: pendingClasses) => {
                let expirationDay = moment(p.purchase.expirationDate)
                if (expirationDay.isBefore(moment())) return false
                if (p.pendingClasses === 0 && p.pendingPasses === 0) return false
                return true
            })

            let pendingC = 0
            let pendingP = 0
            for (var i in classes) {
                pendingC += classes[i].pendingClasses
                pendingP += classes[i].pendingPasses
            }
            let isUnlimited = false
            for (var i in classes) {
                if (classes[i].purchase.Bundle.isUnlimited) {
                    isUnlimited = true
                    break
                }
            }

            if (classes.length == 0) {
                nextExpirationDate = null
            } else {
                nextExpirationDate = classes[classes.length - 1].purchase.expirationDate
            }

            data.push({
                client,
                pending: pendingC,
                taken: bookingsNoPasses.length,
                pendingPasses: pendingP,
                takenPasses: passes.length,
                isUnlimited,
                nextExpirationDate
            })
        }
        return data

    },

    async getClient(clientId: string) {
        const client = await getRepository(User).findOne({
            where: {
                id: clientId
            },
            relations: ['Purchase', 'Purchase.Bundle', 'Purchase.Payment_method', 'Purchase.Transaction', 'Booking', 'Booking.Schedule', 'Booking.Seat', 'Booking.Schedule.Instructor']
        })

        const purchases = await getRepository(Purchase).find({
            where: {
                User: client
            },
            relations: ['Bundle', 'Transaction']
        })
        const bookings = await getRepository(Booking).find({
            where: {
                User: client
            }
        })

        const bookingsNoPasses = await getRepository(Booking).find({
            where: {
                User: client,
                isPass: false
            }
        })

        const passes = await getRepository(Booking).find({
            where: {
                User: client,
                isPass: true
            }
        })

        let classes: pendingClasses[]
        classes = await getPendingClasses(purchases, bookings)
        delete client.password
        classes = classes.filter((p: pendingClasses) => {
            let expirationDay = moment(p.purchase.expirationDate)
            if (expirationDay.isBefore(moment())) return false
            if (p.pendingClasses === 0 && p.pendingPasses === 0) return false
            return true
        })

        let pendingC = 0
        let pendingP = 0
        for (var i in classes) {
            pendingC += classes[i].pendingClasses
            pendingP += classes[i].pendingPasses
        }
        let isUnlimited = false
        for (var i in classes) {
            if (classes[i].purchase.Bundle.isUnlimited) {
                isUnlimited = true
                break
            }
        }

        let nextExpirationDate: Date
        if (classes.length == 0) {
            nextExpirationDate = null
        } else {
            nextExpirationDate = classes[classes.length - 1].purchase.expirationDate
        }

        return {
            ...client,
            pending: pendingC,
            taken: bookingsNoPasses.length,
            pendingPasses: pendingP,
            takenPasses: passes.length,
            isUnlimited,
            nextExpirationDate
        }
    },

    async createClient(data: CustomerData) {
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

        await sendActivationUrl(client.email, client.tempToken)
        return client
    },


    async changeClientStatus(clientId: string) {
        const clientRepository = getRepository(User)

        const client = await getRepository(User).findOne({
            where: {
                id: clientId
            }
        })
        if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')


        client.isDeleted = !client.isDeleted
        await clientRepository.save(client)

    },

    async updateClient(data: ClientData) {
        const clientRepository = getRepository(User)
        const updateClient = await getRepository(User).findOne({
            where: {
                id: data.id
            }
        })
        if (!updateClient) throw new ErrorResponse(404, 14, 'El usuario no existe')

        updateClient.name = data.name ? data.name : updateClient.name
        updateClient.email = data.email ? data.email : updateClient.email
        updateClient.lastname = data.lastname ? data.lastname : updateClient.lastname

        updateClient.password = data.password ? data.password : updateClient.password
        updateClient.pictureUrl = data.pictureUrl ? data.pictureUrl : updateClient.pictureUrl
        updateClient.facebookId = data.facebookId ? data.facebookId : updateClient.facebookId
        updateClient.googleId = data.googleId ? data.googleId : updateClient.googleId
        updateClient.isAdmin = data.isAdmin ? data.isAdmin : updateClient.isAdmin
        updateClient.createdAt = data.createdAt ? data.createdAt : updateClient.createdAt

        await clientRepository.save(updateClient)
    },
    async pruebas() {
        const currentDate = new Date()
        console.log(currentDate)
        //const clients = await getRepository(User).createQueryBuilder().select("users").from(User,"users").where("users.name = :name", {name:"Andres"}).getMany()

        const clients = await getRepository(User).createQueryBuilder()
        .select("*")
            .innerJoin("User.Booking", "Bookings")
            .innerJoin("User.Purchase", "Purchases")
            .where("User.id = :id", { id: "ee7d1d85-d185-4004-84bd-6cce7dc9420d" })
            .getMany

        //const clients = await getRepository(Purchase).createQueryBuilder().innerJoinAndSelect("Purchase.Bundle","Bundles").where("Purchase.expirationDate >= :date",{date: currentDate}).getMany()
        //console.log(clients)


        return clients
    }
}