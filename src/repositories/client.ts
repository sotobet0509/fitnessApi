import { Booking } from './../entities/Bookings';
import { Purchase } from './../entities/Purchases';
import { getRepository, getConnection, Repository, Between, createQueryBuilder } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { User } from '../entities/Users'
import { ClientData, CustomerData } from '../interfaces/auth'
import { PasswordService } from '../services/password'
import * as moment from 'moment'
import { getPendingClasses, orderLiderPurchasesByExpirationDay } from '../utils';
import { pendingClasses } from '../interfaces/purchase';
import { sendActivationUrl } from '../services/mail';
import { Bundle } from '../entities/Bundles';
import { GroupName, MembersGroup, UserId } from '../interfaces/me';

import { TokenService } from '../services/token';
import e = require('express');

export const ClientRepository = {
    async getAllClients() {

        let clients = await getRepository(User).find({
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

            const bookingsNoPasses = await createQueryBuilder(Booking)
            .leftJoinAndSelect('Booking.User', 'User')
            .leftJoinAndSelect('User.Purchase', 'Purchase')
            .leftJoinAndSelect('Purchase.Bundle', 'Bundle')
            .where('User.id=:idUser', { idUser: client.id })
            .andWhere('Booking.isPass=:isPass', { isPass: false })
            .andWhere('Bundle.isGroup=:isGroup', { isGroup: false })
            .getMany();

        const passes = await createQueryBuilder(Booking)
            .leftJoinAndSelect('Booking.User', 'User')
            .innerJoinAndSelect('User.Purchase', 'Purchase')
            .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
            .where('Bundle.isGroup=:isGroup', { isGroup: false })
            .andWhere('Booking.isPass=:isPass', { isPass: true })
            .andWhere('User.id=:idUser', { idUser: client.id })
            .getMany();

        
            // const bookingsNoPasses = await getRepository(Booking).find({
            //     where: {
            //         User: client,
            //         isPass: false
            //     }
            // })

            // const passes = await getRepository(Booking).find({
            //     where: {
            //         User: client,
            //         isPass: true
            //     }
            // })

            let boookingsArray: Booking[] = []
            boookingsArray = bookingsNoPasses.concat(passes)

            let classes: pendingClasses[]

            classes = await getPendingClasses(client.Purchase, boookingsArray)
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
                pending: pendingC ,
                taken: bookingsNoPasses.length,
                pendingPasses: pendingP,
                takenPasses: passes.length,
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
            //console.log(pendingC);

            for (const k in members) {
                for (const l in data) {
                    //console.log(data[l].client)
                    if (data[l].client.id == members[k].id) {
                        if(!data[l].client.fromGroup){
                            data[l].pending -= pendingC 
                            data[l].taken -= boookingsArray.length - boookingsPassesArray.length
                        }
                        data[l].pendingGroup = pendingC 
                        data[l].pendingPassesGroup = pendingP
                        data[l].takenGroup = boookingsArray.length - boookingsPassesArray.length
                        data[l].takenPassesGroup = boookingsPassesArray.length
                        //console.log(data[l]);
                    }

                }
            }
        }

        return data

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
            },
            relations: ['Purchase', 'Booking', 'User_categories', 'User_categories.Categories', 'User_categories.Categories.User_items', 'Booking.Schedule', 'Booking.Seat', 'Booking.Schedule.Instructor', 'Purchase.Bundle', 'Purchase.Payment_method', 'Purchase.Transaction']

        })



        if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')
        let mainUser
        if (client.fromGroup) {
            mainUser = client.fromGroup
        } else {
            mainUser = client.id
        }

        let clientGroup = await createQueryBuilder(User)
            .leftJoinAndSelect('User.Purchase', 'Purchase')
            .leftJoinAndSelect('Purchase.Bundle', 'Bundle')
            .where('Bundle.isGroup=:isGroup', { isGroup: true })
            .andWhere('Purchase.users_id=:idUser', { idUser: mainUser })
            .getOne();


        let pendingGroupC = 0
        let pendingGroupP = 0
        let boookingsArrayTotal: Booking[] = []
        let boookingsArray: Booking[] = []
        let boookingsPassesArray: Booking[] = []

        let isUnlimitedGroup = false
        
        if (clientGroup) {
            for (const i in clientGroup.Purchase) {
                let bookingsPurchases = await getRepository(Booking).find({
                    where:
                    {
                        fromPurchase: clientGroup.Purchase[i].id,
                        isPass: false
                    }
                })
                let bookingsPassesPurchases = await getRepository(Booking).find({
                    where:
                    {
                        fromPurchase: clientGroup.Purchase[i].id,
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


            let classesGroup: pendingClasses[]
            classesGroup = await getPendingClasses(clientGroup.Purchase, boookingsArrayTotal)
            classesGroup = classesGroup.filter((p: pendingClasses) => {
                let expirationDay = moment(p.purchase.expirationDate)
                if (expirationDay.isBefore(moment())) return false
                if (p.pendingClasses === 0 && p.pendingPasses === 0) return false
                return true
            })


            for (var i in classesGroup) {
                pendingGroupC += classesGroup[i].pendingClasses
                pendingGroupP += classesGroup[i].pendingPasses
            }
            
            for (var i in classesGroup) {
                if (classesGroup[i].purchase.Bundle.isUnlimited) {
                    isUnlimitedGroup = true
                    break
                }
            }
        }


        /* const bookingsNoPasses = await getRepository(Booking).find({
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
        }) */

        const bookingsNoPasses = await createQueryBuilder(Booking)
            .leftJoinAndSelect('Booking.User', 'User')
            .leftJoinAndSelect('User.Purchase', 'Purchase')
            .leftJoinAndSelect('Purchase.Bundle', 'Bundle')
            .where('User.id=:idUser', { idUser: client.id })
            .andWhere('Booking.isPass=:isPass', { isPass: false })
            .andWhere('Bundle.isGroup=:isGroup', { isGroup: false })
            .getMany();

        const passes = await createQueryBuilder(Booking)
            .leftJoinAndSelect('Booking.User', 'User')
            .innerJoinAndSelect('User.Purchase', 'Purchase')
            .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
            .where('Bundle.isGroup=:isGroup', { isGroup: false })
            .andWhere('Booking.isPass=:isPass', { isPass: true })
            .andWhere('User.id=:idUser', { idUser: client.id })
            .getMany();

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

        let nextExpirationDate: Date
        if (classes.length == 0) {
            nextExpirationDate = null
        } else {
            nextExpirationDate = classes[classes.length - 1].purchase.expirationDate
        }
        if (client.fromGroup) {
            return {
                ...client,
                pending: pendingC ,
                taken: bookingsNoPasses.length,
                pendingPasses: pendingP - pendingGroupP,
                takenPasses: passes.length - boookingsPassesArray.length,
                isUnlimited,
                isUnlimitedGroup,
                nextExpirationDate,
                pendingGroup: pendingGroupC,
                takenGroup: boookingsArray.length,
                pendingPassesGroup: pendingGroupP - boookingsPassesArray.length,

            }
        } else {
            return {
                ...client,
                pending: pendingC - pendingGroupC,
                taken: bookingsNoPasses.length ,
                pendingPasses: pendingP - pendingGroupP,
                takenPasses: passes.length - boookingsPassesArray.length,
                isUnlimited,
                isUnlimitedGroup,
                nextExpirationDate,
                pendingGroup: pendingGroupC,
                takenGroup: boookingsArray.length,
                pendingPassesGroup: pendingGroupP - boookingsPassesArray.length,
                takenPassesGroup: boookingsPassesArray.length
            }
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
        console.log(data.user_id);

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
    }

}