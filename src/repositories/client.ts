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

        const pages = parseInt(page) - 1
        let clients = await createQueryBuilder(User)
            .select([
                "User.id",
                "User.name",
                "User.lastname",
                "User.email",
                "User.createdAt",
                "User.isDeleted"
            ])
            .where("User.isDeleted=false")
            .skip(pages * 10)
            .take(10)
            .getMany();

        let pagesNumber = await createQueryBuilder(User)
            .select([
                "User.id"
            ])
            .where("User.isDeleted=false")
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
        return { data, pages: pagesNumber }

    },

    async getClient(clientId: string) {

        let currentDate = moment().tz("America/Mexico_City")
        let pendingClasses = 0
        let pendingClassesGroup = 0
        let pendingPasses = 0
        let client = await getRepository(User).findOne({
            where: {
                id: clientId,
                isDeleted: false
            },
            relations: ["ClassesHistory", 'User_categories', 'User_categories.Categories', 'User_categories.Categories.User_items'],

        })

        const purchases = await createQueryBuilder(Purchase)
            .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
            .where('Purchase.expirationDate>:cDate', { cDate: currentDate.format('YYYY-MM-DD') })
            .andWhere('(Purchase.status IN ("Completada") OR Purchase.status IS null)')
            .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
            .andWhere('Purchase.users_id=:userId', { userId: client.id })
            .andWhere('Bundle.isGroup=:isGroup', { isGroup: false })
            .getMany();

        let mainUser = ""

        if (client.fromGroup) {
            mainUser = client.fromGroup
        } else {
            mainUser = client.id
        }
        const groupPurchases = await createQueryBuilder(Purchase)
            .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
            .where('Purchase.expirationDate>:cDate', { cDate: currentDate.format('YYYY-MM-DD') })
            .andWhere('(Purchase.status IN ("Completada") OR Purchase.status IS null)')
            .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
            .andWhere('Purchase.users_id=:userId', { userId: mainUser })
            .andWhere('Bundle.isGroup=:isGroup', { isGroup: true })
            .getMany();

        for (var i in purchases) {
            pendingPasses += (purchases[i].Bundle.passes + purchases[i].addedPasses)
            pendingClasses += (purchases[i].Bundle.classNumber + purchases[i].addedClasses)
        }

        for (var i in groupPurchases) {
            pendingClassesGroup += (groupPurchases[i].Bundle.classNumber + groupPurchases[i].addedClasses)
        }

        if (pendingPasses < 0) pendingPasses = 0
        if (pendingClasses < 0) pendingClasses = 0
        if (pendingClassesGroup < 0) pendingClassesGroup = 0


        delete client.googleId
        delete client.fromGroup
        delete client.isLeader
        delete client.password
        delete client.tempToken
        delete client.isAdmin
        delete client.groupName
        delete client.changed
        let takenC = client.ClassesHistory.takenClasses
        let takenP = client.ClassesHistory.takenPasses
        let takenGC = client.ClassesHistory.takenGroupClasses
        delete client.ClassesHistory

        return {
            ...client,
            taken: takenC,
            takenPasses: takenP,
            takenGroup: takenGC,
            pending: pendingClasses,
            pendingPasses: pendingPasses,
            pendingGroup: pendingClassesGroup
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
                id: clientId,
                isDeleted: false
            }
        })
        if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')

        client.isDeleted = true
        const newMail = moment().format("YYYY-MM-DD").toString() + moment().format("HH:mm:ss").toString() + "@dominio.com"
        client.email = newMail
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
                id: data.id,
                isDeleted: false
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
        const queryArray = query.split(" ")
        let clients
        if (queryArray.length == 1) {
            clients = await createQueryBuilder(User)
                .where("isDeleted =:status", { status: false })
                .andWhere("User.isAdmin =:admin", { admin: false })
                .andWhere('name like :query or lastname like :query or email like :query', {
                    query: '%' + query + '%',
                })
                .leftJoinAndSelect('User.ClassesHistory', 'ClassesHistory')
                .limit(20)
                .getMany()

        } else {
            clients = await createQueryBuilder(User)
                .where("isDeleted =:status", { status: false })
                .andWhere("User.isAdmin =:admin", { admin: false })
                .andWhere('(name like :query and lastname like :query2) or (name like :query3) ', {
                    query: '%' + queryArray[0] + '%',
                    query2: '%' + queryArray[1] + '%',
                    query3: '%' + queryArray[0] + '%' + queryArray[1] + '%'
                })
                .leftJoinAndSelect('User.ClassesHistory', 'ClassesHistory')
                .limit(20)
                .getMany()
        }
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

            let pendingClasses = 0
            let pendingClassesGroup = 0
            let pendingPasses = 0
            let isUnlimited = false
            let isUnlimitedGroup = false

            const purchases = await createQueryBuilder(Purchase)
                .leftJoinAndSelect('Purchase.Bundle', 'Bundle')
                .leftJoinAndSelect('Purchase.User', 'User')
                .where('Purchase.users_id=:userId', { userId: clients[i].id })
                .andWhere('Purchase.expirationDate>:cDate', { cDate: currentDate.format('YYYY-MM-DD') })
                .andWhere('(Purchase.status IN ("Completada") OR Purchase.status IS null)')
                .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
                .andWhere('Bundle.isGroup=:isGroup', { isGroup: false })
                .getMany();

            let mainUser = ""

            if (clients[i].fromGroup) {
                mainUser = clients[i].fromGroup
            } else {
                mainUser = clients[i].id
            }
            const groupPurchases = await createQueryBuilder(Purchase)
                .leftJoinAndSelect('Purchase.Bundle', 'Bundle')
                .where('Purchase.expirationDate>:cDate', { cDate: currentDate.format('YYYY-MM-DD') })
                .andWhere('(Purchase.status IN ("Completada") OR Purchase.status IS null)')
                .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
                .andWhere('Purchase.users_id=:userId', { userId: mainUser })
                .andWhere('Bundle.isGroup=:isGroup', { isGroup: true })
                .getMany();

            for (var j in purchases) {
                pendingPasses += (purchases[j].Bundle.passes + purchases[j].addedPasses)
                pendingClasses += (purchases[j].Bundle.classNumber + purchases[j].addedClasses)
                if (purchases[j].Bundle.isUnlimited) {
                    isUnlimited = true
                }
            }

            for (var j in groupPurchases) {
                pendingClassesGroup += (groupPurchases[j].Bundle.classNumber + groupPurchases[j].addedClasses)
                if (groupPurchases[j].Bundle.isUnlimited) {
                    isUnlimitedGroup = true
                }
            }

            if (!booking) {
                booking = null
            }
            if (pendingPasses < 0) pendingPasses = 0
            if (pendingClasses < 0) pendingClasses = 0
            if (pendingClassesGroup < 0) pendingClassesGroup = 0

            let taken = 0
            let takenPasses = 0
            let takenGruopClasses = 0
            if (clients[i].ClassesHistory) {
                taken = clients[i].ClassesHistory.takenClasses
                takenPasses = clients[i].ClassesHistory.takenPasses
                takenGruopClasses = clients[i].ClassesHistory.takenGroupClasses
                delete clients[i].ClassesHistory
            }

            let nextExpirationDate: Date
            if (purchases.length == 0) {
                nextExpirationDate = null
            } else {
                nextExpirationDate = purchases[purchases.length - 1].expirationDate
            }

            let nextGroupExpirationDate: Date
            if (groupPurchases.length == 0) {
                nextGroupExpirationDate = null
            } else {
                nextGroupExpirationDate = groupPurchases[groupPurchases.length - 1].expirationDate
            }

            if(pendingClasses == 0 && pendingPasses == 0){
                nextExpirationDate = null
            }
            if(pendingClassesGroup == 0){
                nextGroupExpirationDate = null
            }

            data.push({
                ...clients[i],
                nextClass: booking,
                pending: pendingClasses,
                pendingPasses: pendingPasses,
                pendingGroup: pendingClassesGroup,
                taken: taken,
                takenPasses: takenPasses,
                takenGroup: takenGruopClasses,
                isUnlimited: isUnlimited,
                isUnlimitedGroup: isUnlimitedGroup,
                nextExpirationDate: nextExpirationDate,
                nextGroupExpirationDate: nextGroupExpirationDate
            })
        }
        return {
            data,
            pagesNumber: clients.length
        }
    }

}