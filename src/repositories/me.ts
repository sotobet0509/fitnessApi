import { getRepository, createQueryBuilder, Not } from 'typeorm'
import { User } from '../entities/Users'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Purchase, status } from '../entities/Purchases'
import { Booking } from '../entities/Bookings'
import { getPendingClasses, orderByExpirationDay, orderLiderPurchasesByExpirationDay } from "../utils/index"
import { MemberEmail, pendingClasses } from '../interfaces/purchase'
import * as moment from 'moment'
import { Folios } from '../entities/Folios'
import { ClientData } from '../interfaces/auth'
import { PasswordService } from '../services/password'
import { Categories } from '../entities/Categories'
import { User_items } from '../entities/User_items'
import { User_categories } from '../entities/UserCategories'
import { EditItems } from '../interfaces/items'
import { GroupName, UserId } from '../interfaces/me'
import { TokenService } from '../services/token'
import { ClassesHistory } from '../entities/ClassesHistory'



export const MeRepository = {
    async getProfile(id: string) {
        const repository = getRepository(User)
        const profile = await repository.findOne({
            where: {
                id: id,
                isDeleted: false
            },
            relations: ["User_categories", "User_categories.Categories", "User_categories.Categories.User_items"]
        })
        if (!profile) throw new ErrorResponse(404, 10, 'El usuario no existe')
        const bookings = await getRepository(Booking).find({
            where: {
                User: profile
            },
            relations: ['Schedule', 'Schedule.Instructor']
        })
        let minutesDone = 0
        let favorites = []
        for (var i in bookings) {
            const booking: Booking = bookings[i]
            const schedule = booking.Schedule
            const start = moment(schedule.date).set({
                hour: new Date(`2020-01-01 ${schedule.start}`).getHours(),
                minutes: new Date(`2020-01-01 ${schedule.start}`).getMinutes(),
                seconds: 0
            })
            const end = moment(schedule.date).set({
                hour: new Date(`2020-01-01 ${schedule.end}`).getHours(),
                minutes: new Date(`2020-01-01 ${schedule.end}`).getMinutes(),
                seconds: 0
            })
            const minutes = moment.duration(end.diff(start))
            if (start.isBefore(moment()) && moment(schedule.date).month() === moment().month()) {
                minutesDone += minutes.asMinutes()
            }
            const instructor = schedule.Instructor
            let added = false
            for (var j in favorites) {
                const fav = favorites[j]
                if (instructor.name === fav[0]) {
                    added = true
                    favorites[j][1] = favorites[j][1] + 1
                    break
                }
            }
            if (!added) {
                favorites.push([instructor.name, 1])
            }
        }
        let sFav = ""
        let sFavNum = 0
        for (var i in favorites) {
            const fav = favorites[i]
            if (fav[1] > sFavNum) {
                sFavNum = fav[1]
                sFav = fav[0]
            }
        }
        delete profile.password

        return {
            profile,
            minutesDone,
            favorite: sFav
        }
    },

    async getHistory(page: string, user: User) {
        const pages = parseInt(page) - 1
        let pagesNumber
        let purchases = await getRepository(Purchase).find({
            where: [
                {
                    User: user,
                    status: status.FINISHED
                },
                {

                    User: user,
                    status: null
                }
            ],
            skip: pages * 10,
            take: 10,
            relations: ['User', 'Bundle', 'Payment_method', 'Transaction'],
            order: {
                expirationDate: "DESC"
            }
        })
        pagesNumber = await getRepository(Purchase).find({
            where: [
                {
                    User: user,
                    status: status.FINISHED
                },
                {

                    User: user,
                    status: null
                }
            ],
            relations: ['User', 'Bundle', 'Payment_method', 'Transaction']
        })
        pagesNumber = pagesNumber.length
        let clases = 0


        for (var i in purchases) {
            const bundle = purchases[i].Bundle
            const buyedAt = moment(purchases[i].date)
            // no se añaden clases de paquetes expirados
            if (moment().diff(buyedAt, 'days') <= bundle.expirationDays) {
                clases += purchases[i].Bundle.classNumber
            }
            let folio = await getRepository(Folios).findOne({
                where: {
                    purchase: purchases[i].id
                },
                relations: ["Alternate_users"]
            })
            purchases[i]['folio'] = folio

        }
    
        return {
            purchases,
            pages: pagesNumber
        }
    },

    async getClasses(user: User) {
        let currentDate = moment().tz("America/Mexico_City")
        let pendingClasses = 0
        let pendingClassesGroup = 0
        let pendingPasses = 0
        let isUnlimited = false
        let isUnlimitedGroup = false
        let lastAvaliblePurchase = 0
        let lastAvalibleGroupPurchase = 0

        let purchasePendingClasses = 0
        let purchasePendingClassesGroup = 0
        let purchasePendingPasses = 0

        let client = await getRepository(User).findOne({
            where: {
                id: user.id,
                isDeleted: false
            },
            relations: ["ClassesHistory"]
        })
        const purchases = await createQueryBuilder(Purchase)
            .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
            .where('Purchase.expirationDate>:cDate', { cDate: currentDate.format('YYYY-MM-DD') })
            .andWhere('(Purchase.status IN ("Completada") OR Purchase.status IS null)')
            .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
            .andWhere('Purchase.users_id=:userId', { userId: client.id })
            .andWhere('Bundle.isGroup=:isGroup', { isGroup: false })
            .orderBy('Purchase.expirationDate', "ASC")
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
            .orderBy('Purchase.expirationDate', "ASC")
            .getMany();

        for (var i in purchases) {
            pendingPasses += (purchases[i].Bundle.passes + purchases[i].addedPasses)
            pendingClasses += (purchases[i].Bundle.classNumber + purchases[i].addedClasses)
            purchasePendingPasses = (purchases[i].Bundle.passes + purchases[i].addedPasses)
            purchasePendingClasses = (purchases[i].Bundle.classNumber + purchases[i].addedClasses)
            if (purchases[i].Bundle.isUnlimited) {
                isUnlimited = true
            }
            if (purchasePendingClasses > 0 || purchasePendingPasses > 0) {
                lastAvaliblePurchase = parseInt(i)
            }
        }

        for (var i in groupPurchases) {
            pendingClassesGroup += (groupPurchases[i].Bundle.classNumber + groupPurchases[i].addedClasses)
            purchasePendingClassesGroup = (groupPurchases[i].Bundle.classNumber + groupPurchases[i].addedClasses)
            if (groupPurchases[i].Bundle.isUnlimited) {
                isUnlimitedGroup = true
            }
            if (purchasePendingClassesGroup > 0 ) {
                lastAvalibleGroupPurchase = parseInt(i)
            }
        }
        if (pendingClasses < 0) pendingClasses = 0
        if (pendingClassesGroup < 0) pendingClassesGroup = 0
        if (pendingPasses < 0) pendingPasses = 0
        if (groupPurchases.length > 0 && purchases.length > 0) {
            if (groupPurchases[lastAvalibleGroupPurchase].expirationDate > purchases[lastAvaliblePurchase].expirationDate) {
                lastAvaliblePurchase = lastAvalibleGroupPurchase
            }
        }

        let nextExpirationDate: Date
        if (purchases.length == 0) {
            nextExpirationDate = null
        } else {
           nextExpirationDate = purchases[purchases.length -1 ].expirationDate
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

        return {
            taken: client.ClassesHistory.takenClasses,
            takenPasses: client.ClassesHistory.takenPasses,
            takenGroup: client.ClassesHistory.takenGroupClasses,
            pending: pendingClasses,
            pendingPasses: pendingPasses,
            pendingGroup: pendingClassesGroup,
            isUnlimited: isUnlimited,
            isUnlimitedGroup: isUnlimitedGroup,
            nextExpirationDate: nextExpirationDate,
            nextGroupExpirationDate: nextGroupExpirationDate
        }
    },

    async uploadProfilePicture(url: string, user: User) {
        const userRepository = getRepository(User)
        user.pictureUrl = url
        await userRepository.save(user)
    },

    async updateUserData(userdata: User, data: ClientData) {
        const updateUser = userdata
        if (data.password) {
            const passwordService = new PasswordService(data.password)
            const password = await passwordService.getHashedPassword()
            updateUser.password = data.password ? password : updateUser.password
        }
        updateUser.name = data.name ? data.name : updateUser.name
        updateUser.email = data.email ? data.email : updateUser.email
        updateUser.lastname = data.lastname ? data.lastname : updateUser.lastname


        await getRepository(User).save(updateUser)
    },

    async getItems(userdata: User) {

        const items = await getRepository(User_categories).find({
            where: {
                User: userdata
            },
            relations: ["Categories"]
        })
        return items
    },

    async getItemCategories(itemId: number) {
        const categories = await getRepository(Categories).find({
            where: {
                User_items: itemId
            }
        })

        return categories
    },

    async getAllItems() {
        const items = await getRepository(User_items).find({
            relations: ["Categories"]
        })
        return items
    },

    async editItems(data: EditItems, userdata: User) {
        const deleteItems = await getRepository(User_categories).find({
            where: {
                User: userdata
            }
        })

        for (var i in deleteItems) {
            await getRepository(User_categories).delete(deleteItems[i])
        }


        for (var j in data.categories) {
            let newUserCategory = new User_categories
            const newCategory = await getRepository(Categories).findOne({
                where: {
                    id: data.categories[j]
                }
            })
            newUserCategory.User = userdata
            newUserCategory.Categories = newCategory
            await getRepository(User_categories).save(newUserCategory)
        }
    },

    async getMembers(user: User) {
        let leaderId = "notNull"
        let members: User[]
        if (user.isLeader) {
            leaderId = user.id

            members = await getRepository(User).find({
                where:
                {
                    fromGroup: leaderId,
                }
            })
        } else if (user.fromGroup) {
            leaderId = user.fromGroup
            members = await getRepository(User).find({
                where: [
                    {
                        fromGroup: leaderId,
                        id: Not(user.id)
                    },
                    { id: leaderId }
                ]
            })
        }
        else throw new ErrorResponse(404, 10, 'El usuario no pertenece a un grupo')

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

        const groupName = await getRepository(User).findOne({
            where: {
                id: leaderId
            }
        })

        return [membersData, groupName.groupName]
    },

    async removeMember(user: User, memberId: UserId) {
        if (user.changed < 1) throw new ErrorResponse(404, 16, "No quedan cambios disponibles. Por favor acércate a front desk")

        const member = await getRepository(User).findOne({
            where: {
                id: memberId.user_id,
                fromGroup: user.id
            }
        })
        if (!member) throw new ErrorResponse(404, 16, "El usuario no pertenece a este grupo")
        member.fromGroup = null
        await getRepository(User).save(member)
        user.changed -= 1
        await getRepository(User).save(user)
    },

    async inviteMember(userId: string, memberEmail: MemberEmail) {
        const clientRepository = getRepository(User)
        const user = await getRepository(User).findOne({
            where: {
                id: userId
            }
        })

        const member = await getRepository(User).findOne({
            where: {
                email: memberEmail.email
            }
        })

        if (!user) throw new ErrorResponse(404, 47, 'El usuario no existe')
        if (!user.isLeader) throw new ErrorResponse(404, 61, 'El usuario no es lider')

        const members = await getRepository(User).find({
            where: [
                {
                    fromGroup: user.id
                },
                {
                    id: user.id
                }
            ]
        })

        const liderPurchases = await createQueryBuilder(User)
            .innerJoinAndSelect('User.Purchase', 'Purchase')
            .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
            .where('Bundle.isGroup=:isGroup', { isGroup: true })
            .andWhere('Purchase.users_id=:idUser', { idUser: user.id })
            .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
            .getOne();

        const orderedPurchases = orderLiderPurchasesByExpirationDay(liderPurchases.Purchase)

        if (members.length >= orderedPurchases[0].Bundle.memberLimit) throw new ErrorResponse(404, 63, 'El grupo ya está lleno')

        if (member) {
            if (member.fromGroup) throw new ErrorResponse(404, 62, 'El miembro ya cuenta con un grupo')
            member.fromGroup = user.id
            await clientRepository.save(member)
        } else {
            const userToken = new TokenService(user.id)
            const token = await userToken.signTokenLider()

            return token
        }

    },

    async changeGroupName(user: User, data: GroupName) {
        let leader = await getRepository(User).findOne({
            where: {
                id: user.id
            }
        })
        if (!leader) throw new ErrorResponse(404, 62, 'El usuario no existe')

        leader.groupName = data.groupName

        await getRepository(User).save(leader)
    },

    async updateClassesHistory() {
        const allclients = await getRepository(User).find({
            relations: ["Booking"]
        })

        for (var i in allclients) {
            let classes = 0
            let passes = 0
            for (var j in allclients[i].Booking) {
                if (allclients[i].Booking[j].isPass) {
                    passes++
                } else {
                    classes++
                }
            }

            let classesHistory = new ClassesHistory
            classesHistory.takenGroupClasses = 0
            classesHistory.takenClasses = classes
            classesHistory.takenPasses = passes
            classesHistory.User = allclients[i]

            await getRepository(ClassesHistory).save(classesHistory)
        }
    },

    async updatePendings() {
        const currentDate = moment().tz("America/Mexico_City").format('YYYY-MM-DD')
        const allPurchases = await createQueryBuilder(Purchase)
            .innerJoinAndSelect('Purchase.Bundle', 'Bundle')
            .where('Purchase.expirationDate>:cDate', { cDate: currentDate })
            .andWhere('(Purchase.status IN ("Completada") OR Purchase.status IS null)')
            .andWhere('Purchase.isCanceled=:isCanceled', { isCanceled: false })
            .getMany();

        for (var i in allPurchases) {
            const bookings = await getRepository(Booking).find({
                where: {
                    fromPurchase: allPurchases[i]
                }
            })

            if (bookings.length > 0) {
                allPurchases[i].addedClasses -= bookings.length
                await getRepository(Purchase).save(allPurchases[i])
            }
        }
    }

}