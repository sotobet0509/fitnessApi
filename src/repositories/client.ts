import { MeRepository } from './me';
import { Booking } from './../entities/Bookings';
import { Purchase } from './../entities/Purchases';
import { getRepository, createQueryBuilder, QueryBuilder } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { User } from '../entities/Users'
import { ClientData, CustomerData } from '../interfaces/auth'
import * as moment from 'moment'
import { getPendingClasses, orderLiderPurchasesByExpirationDay } from '../utils';
import { pendingClasses } from '../interfaces/purchase';
import { sendActivationUrl } from '../services/mail';
import { GroupName, UserId } from '../interfaces/me';

import { TokenService } from '../services/token';

export const ClientRepository = {
    async getAllClients(page: string) {

        /*let clients = await getRepository(User).find({
            relations: ['Purchase', 'Purchase.Bundle', 'Booking']
        })

        // let clients = await createQueryBuilder(User)
        //     .leftJoinAndSelect('User.Purchase', 'Purchase')
        //     .leftJoinAndSelect('Purchase.Bundle', 'Bundle')
        //     .where('Bundle.isGroup=:isGroup', { isGroup: false })
        //     .getMany();

        let clientsGroup = await createQueryBuilder(User)
            .leftJoinAndSelect('User.Purchase', 'Purchase')
            .leftJoinAndSelect('Purchase.Bundle', 'Bundle')
            .where('Bundle.isGroup=:isGroup', { isGroup: true })
            .getMany();


        let data = []
        let nextExpirationDate: Date

        for (var i in clients) {
            let client = clients[i]

            // const bookingsNoPasses = await createQueryBuilder(Booking)
            //     .leftJoinAndSelect('Booking.User', 'User')
            //     .leftJoinAndSelect('User.Purchase', 'Purchase')
            //     .leftJoinAndSelect('Purchase.Bundle', 'Bundle')
            //     .where('User.id=:idUser', { idUser: client.id })
            //     .andWhere('Booking.isPass=:isPass', { isPass: false })
            //     .andWhere('Bundle.isGroup=:isGroup', { isGroup: false })
            //     .getMany();

            // const passes = await createQueryBuilder(Booking)
            //     .leftJoinAndSelect('Booking.User', 'User')
            //     .innerJoinAndSelect('User.Purchase', 'Purchase')
            //     .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
            //     .where('Bundle.isGroup=:isGroup', { isGroup: false })
            //     .andWhere('Booking.isPass=:isPass', { isPass: true })
            //     .andWhere('User.id=:idUser', { idUser: client.id })
            //     .getMany();


            // // const bookingsNoPasses = await getRepository(Booking).find({
            // //     where: {
            // //         User: client,
            // //         isPass: false
            // //     }
            // // })

            // // const passes = await getRepository(Booking).find({
            // //     where: {
            // //         User: client,
            // //         isPass: true
            // //     }
            // // })

            // let boookingsArray: Booking[] = []
            // boookingsArray = bookingsNoPasses.concat(passes)

            let classes: pendingClasses[] = []

            // classes = await getPendingClasses(client.Purchase, boookingsArray)
            // delete client.password
            // classes = classes.filter((p: pendingClasses) => {
            //     let expirationDay = moment(p.purchase.expirationDate)
            //     if (expirationDay.isBefore(moment())) return false
            //     if (p.pendingClasses === 0 && p.pendingPasses === 0) return false
            //     return true
            // })

            // let pendingC = 0
            // let pendingP = 0
            // for (var i in classes) {
            //     pendingC += classes[i].pendingClasses
            //     pendingP += classes[i].pendingPasses
            // }
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
                pending: 0,
                taken: 0,
                pendingPasses: 0,
                takenPasses: 0,
                isUnlimited,
                nextExpirationDate,
                pendingGroup: 0,
                takenGroup: 0,
                pendingPassesGroup: 0,
                takenPassesGroup: 0
            })
        }

        for (const key in clientsGroup) {
            const client = clientsGroup[key]

            const members = await getRepository(User).find({
                where: [
                    {
                        fromGroup: client.id
                    },
                    {
                        id: client.id
                    }
                ]
            })
            let boookingsArrayTotal: Booking[] = []
            let boookingsArray: Booking[] = []
            let boookingsPassesArray: Booking[] = []
            for (const i in client.Purchase) {
                let bookingsPurchases = await getRepository(Booking).find({
                    where:
                    {
                        fromPurchase: client.Purchase[i].id,
                        isPass: false
                    }
                })
                let bookingsPassesPurchases = await getRepository(Booking).find({
                    where:
                    {
                        fromPurchase: client.Purchase[i].id,
                        isPass: true
                    }
                })
                for (const j in bookingsPurchases) {
                    boookingsArray.push(bookingsPurchases[j])
                    boookingsArrayTotal.push(bookingsPurchases[j])
                }
                for (const j in bookingsPassesPurchases) {
                    boookingsPassesArray.push(bookingsPassesPurchases[j])
                    boookingsArrayTotal.push(bookingsPassesPurchases[j])
                }
            }


            let classes: pendingClasses[]
            classes = await getPendingClasses(client.Purchase, boookingsArrayTotal)
            classes = classes.filter((p: pendingClasses) => {
                let expirationDay = moment(p.purchase.expirationDate)
                if (expirationDay.isBefore(moment())) return false
                if (p.pendingClasses === 0 && p.pendingPasses === 0) return false
                return true
            })


            let pendingC = 0
            let pendingP = 0
            for (var i in classes) {
                if (!classes[i].purchase.Bundle.isGroup) {
                    pendingC += classes[i].pendingClasses
                    pendingP += classes[i].pendingPasses
                }
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

            for (const k in members) {
                for (const l in data) {
                    if (data[l].client.id == members[k].id) {
                        if (!data[l].client.fromGroup) {
                            data[l].pending -= pendingC
                            data[l].taken -= boookingsArray.length - boookingsPassesArray.length
                        }
                        data[l].pendingGroup = pendingC
                        data[l].pendingPassesGroup = pendingP
                        data[l].takenGroup = boookingsArray.length - boookingsPassesArray.length
                        data[l].takenPassesGroup = boookingsPassesArray.length
                    }

                }
            }
        }
        */
        const pages = parseInt(page)
        let clients = await createQueryBuilder(User)
            .select([
                "User.id",
                "User.name",
                "User.lastname",
                "User.email",
                "User.createdAt",
                "User.isDeleted"
            ])
            .skip(pages * 10)
            .take(10)
            .getMany();

        let pagesNumber = await createQueryBuilder(User)
            .select([
                "User.id"
            ])
            .skip(pages * 10)
            .take(10)
            .getCount();

        let data = []
        let currentDate = moment().tz("America/Mexico_City")
        for (var i in clients) {
            let booking = await createQueryBuilder(Booking)
                .leftJoinAndSelect("Booking.Schedule", "Schedule")
                .where('Date(Schedule.date)>=:cDate', { cDate: moment(currentDate).format('YYYY-MM-DD') })
                .andWhere('Time(Schedule.start)<:cTime', { cTime: moment(currentDate).format("HH:mm:ss") })
                .andWhere('Booking.user_id =:userId', { userId: clients[i].id })
                .orderBy("Schedule.date", "DESC")
                .addOrderBy("Schedule.start", "ASC")
                .getOne();
            if (!booking) {
                booking = null
            }
            data.push({
                client: clients[i],
                nextClass: booking
            })
        }
        //console.log(data)
        return { data, pages: pagesNumber }

    },

    async getClient(clientId: string) {
        // let client = await createQueryBuilder(User)
        //     .leftJoinAndSelect('User.Purchase', 'Purchase')
        //     .leftJoinAndSelect('User.Booking', 'Booking')
        //     .leftJoinAndSelect('User.User_categories', 'User_categories')
        //     .leftJoinAndSelect('User_categories.Categories', 'Categories')
        //     .leftJoinAndSelect('Categories.User_items', 'User_items')
        //     .leftJoinAndSelect('Booking.Schedule', 'Schedule')
        //     .leftJoinAndSelect('Booking.Seat', 'Seat')
        //     .leftJoinAndSelect('Schedule.Instructor', 'Instructor')
        //     .leftJoinAndSelect('Purchase.Bundle', 'Bundle')
        //     .leftJoinAndSelect('Purchase.Payment_method', 'Payment_method')
        //     .leftJoinAndSelect('Purchase.Transaction', 'Transaction')
        //     .where('User.id=:idUser', { idUser: clientId })
        //     .andWhere('Bundle.isGroup=:isGroup', { isGroup: false })
        //     .getOne();

        let client = await getRepository(User).findOne({
            where: {
                id: clientId
            }
        })

        if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')

        let c = await MeRepository.getClasses(client)

        return {
            ...c
        }
        //return clientGroup;
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

    async inviteClientToGroup(clientId: string, email: string) {
        const clientRepository = getRepository(User)

        const lider = await clientRepository.findOne({
            where: {
                id: clientId
            }
        })
        if (!lider) throw new ErrorResponse(404, 14, 'El usuario lider no existe')
        if (!lider.isLeader) throw new ErrorResponse(404, 61, 'El usuario no es lider')

        const member = await clientRepository.findOne({
            where: {
                email: email
            }
        })

        const members = await getRepository(User).find({
            where: [
                {
                    fromGroup: lider.id
                },
                {
                    id: lider.id
                }
            ]
        })

        const liderPurchases = await createQueryBuilder(User)
            .innerJoinAndSelect('User.Purchase', 'Purchase')
            .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
            .where('Bundle.isGroup=:isGroup', { isGroup: true })
            .andWhere('Purchase.users_id=:idUser', { idUser: lider.id })
            .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
            .getOne();

        const orderedPurchases = orderLiderPurchasesByExpirationDay(liderPurchases.Purchase)

        if (members.length >= orderedPurchases[0].Bundle.memberLimit) throw new ErrorResponse(404, 63, 'El grupo ya está lleno')

        if (member) {
            if (member.fromGroup) throw new ErrorResponse(404, 62, 'El miembro ya cuenta con un grupo')
            member.fromGroup = lider.id
            await clientRepository.save(member)
        } else {
            const userToken = new TokenService(lider.id)
            const token = await userToken.signTokenLider()

            return token
        }


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

    async removeMember(data: UserId, memberId: string) {

        const leader = await getRepository(User).findOne({
            where: {
                id: data.user_id
            }
        })
        if (!leader) throw new ErrorResponse(401, 16, "El usuario no existe")
        if (!leader.isLeader) throw new ErrorResponse(401, 16, "El usuario no es Lider de un grupo")
        const member = await getRepository(User).findOne({
            where: {
                id: memberId,
                fromGroup: data.user_id
            }
        })
        if (!member) throw new ErrorResponse(404, 16, "El usuario no pertenece a este grupo")

        member.fromGroup = ""
        await getRepository(User).save(member)
    },

    async getMembers(leaderId: string) {
        const leader = await getRepository(User).findOne({
            where: {
                id: leaderId
            }
        })
        if (!leader.isLeader) throw new ErrorResponse(401, 16, "El usuario no es Lider de un grupo")

        const members = await getRepository(User).find({
            where: [
                { fromGroup: leader.id },
                { id: leaderId }
            ]

        })
        if (!members) throw new ErrorResponse(401, 17, "No hay miembros en su grupo")
        const currentDate = new Date()
        let membersData = []
        for (var i in members) {
            delete members[i].password
            const nextClass = await createQueryBuilder(Booking)
                .innerJoinAndSelect('Booking.Schedule', 'Schedule')
                .where('Booking.user_id=:userId', { userId: members[i].id })
                .andWhere('Schedule.date >=:date', { date: currentDate })
                .orderBy('Schedule.date', 'ASC')
                .getOne()

            membersData.push({
                ...members[i],
                nextClass
            })
        }

        return [membersData, leader.groupName]
    },

    async getAllMembers() {
        //agregar todo el desmadre
        const leaders = await getRepository(User).find({
            where: {
                isLeader: true
            }
        })
        if (leaders.length == 0) throw new ErrorResponse(401, 18, "No hay grupos registrados")

        let groupsData = []
        const currentDate = new Date()
        let groupStatus
        let pending
        for (var i in leaders) {
            delete leaders[i].password

            const purchaseStatus = await createQueryBuilder(Purchase)
                .leftJoinAndSelect('Purchase.Bundle', 'Bundle')
                .leftJoinAndSelect('Purchase.User', 'User')
                .where('User.id=:userId', { userId: leaders[i].id })
                .andWhere('Bundle.isGroup=:isGroup', { isGroup: true })
                .andWhere('Purchase.expirationDate >=:date', { date: currentDate })
                .orderBy('Purchase.date', 'DESC')
                .getOne()

            if (purchaseStatus) {
                groupStatus = true
                const bookings = await getRepository(Booking).find({
                    where: {
                        fromPurchase: purchaseStatus.id
                    }
                })
                pending = (purchaseStatus.Bundle.classNumber - bookings.length)
                if (pending == 0) {
                    groupStatus = false
                }

            } else {
                groupStatus = false
                pending = 0
            }




            groupsData.push({
                ...leaders[i],
                status: groupStatus,
                pendingClasses: pending
            })
        }

        return groupsData
    },

    async renameGroup(client: string, data: GroupName) {
        let leader = await getRepository(User).findOne({
            where: {
                id: client
            }
        })
        if (!leader) throw new ErrorResponse(401, 18, "El usuario no existe")
        if (!leader.isLeader) throw new ErrorResponse(401, 18, "El usuario no es el lider del grupo")

        leader.groupName = data.groupName

        await getRepository(User).save(leader)
    },

    async searchClient(query: string) {
        const clients = await createQueryBuilder(User)
            .where('name like :query or lastname like :query or email like :query', {
                query: '%' + query + '%',
            })
            .andWhere("isDeleted = false")
            .andWhere("isAdmin = false")
            .limit(10)
            .getMany()
        
        let data = []
        let currentDate = moment().tz("America/Mexico_City")
        for (var i in clients) {
            delete clients[i].password
            delete clients[i].pictureUrl
            delete clients[i].googleId
            delete clients[i].facebookId
            delete clients[i].isAdmin
            delete clients[i].pictureUrl
            delete clients[i].tempToken

            let booking = await createQueryBuilder(Booking)
                .leftJoinAndSelect("Booking.Schedule", "Schedule")
                .where('Date(Schedule.date)>=:cDate', { cDate: moment(currentDate).format('YYYY-MM-DD') })
                .andWhere('Time(Schedule.start)<:cTime', { cTime: moment(currentDate).format("HH:mm:ss") })
                .andWhere('Booking.user_id =:userId', { userId: clients[i].id })
                .orderBy("Schedule.date", "DESC")
                .addOrderBy("Schedule.start", "ASC")
                .getOne();

                if (!booking) {
                    booking = null
                }
                data.push({
                    ...clients[i],
                    nextClass: booking
                })
        }
        //console.log(data)
        return data
    }

}