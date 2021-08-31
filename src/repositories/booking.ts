import { getRepository, getConnection, Repository, createQueryBuilder } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Instructor } from '../entities/Instructors'
import { InstructorController } from '../controllers/instructor'
import { InstructorSchema } from '../interfaces/instructor'
import { Booking } from '../entities/Bookings'

import * as moment from 'moment'
import { Schedule } from '../entities/Schedules'
import { Purchase } from '../entities/Purchases'
import { DeleteBooking } from '../interfaces/booking'
import { ClassesHistory } from '../entities/ClassesHistory'

export const BookingRepository = {

    async deleteBooking(bookingId: number) {
        const bookingRepository = getRepository(Booking)

        const booking = await getRepository(Booking).findOne({
            where: {
                id: bookingId
            },
            relations: ['Schedule', 'fromPurchase', 'User', 'fromPurchase.Bundle']
        })
        if (!booking) throw new ErrorResponse(404, 14, 'La reservacion no existe')
        const start = moment(booking.Schedule.date).set({
            hour: new Date("2020-01-01 " + booking.Schedule.start).getHours(),
            minutes: new Date("2020-01-01 " + booking.Schedule.start).getMinutes(),
            seconds: 0
        })
        const duration = moment.duration(start.diff(moment())).asHours() + 6
        if (duration >= 3) {
            if (booking.Schedule.isPrivate) {
                let privatePurchase = await getRepository(Purchase).findOne({
                    where: {
                        id: booking.fromPurchase.id
                    }
                })
                if (booking.isPass) {
                    privatePurchase.addedPasses += 1
                } else {
                    privatePurchase.addedClasses += 1
                }

                let classesHistory = await getRepository(ClassesHistory).findOne({
                    where: {
                        User: booking.User
                    }
                })

                if (booking.isPass) {
                    classesHistory.takenPasses -= 1
                } else if (!booking.isPass && !booking.fromPurchase.Bundle.isGroup) {
                    classesHistory.takenClasses -= 1
                } else if (!booking.isPass && booking.fromPurchase.Bundle.isGroup) {
                    classesHistory.takenGroupClasses -= 1
                }

                await getRepository(ClassesHistory).save(classesHistory)
                await getRepository(Purchase).save(privatePurchase)
                await bookingRepository.remove(booking)
            } else {
                let purchase = await getRepository(Purchase).findOne({
                    where: {
                        id: booking.fromPurchase.id
                    }
                })
                if (booking.isPass) {
                    purchase.addedPasses += 1
                } else {
                    purchase.addedClasses += 1
                }

                let classesHistory = await getRepository(ClassesHistory).findOne({
                    where: {
                        User: booking.User
                    }
                })

                if (booking.isPass) {
                    classesHistory.takenPasses -= 1
                } else if (!booking.isPass && !booking.fromPurchase.Bundle.isGroup) {
                    classesHistory.takenClasses -= 1
                } else if (!booking.isPass && booking.fromPurchase.Bundle.isGroup) {
                    classesHistory.takenGroupClasses -= 1
                }

                await getRepository(ClassesHistory).save(classesHistory)
                await getRepository(Purchase).save(purchase)
                await bookingRepository.remove(booking)
            }
        } else {
            throw new ErrorResponse(409, 18, 'La reservacion ya no se puede eliminar')
        }
    },

    async getSeats(scheduleId: number) {
        const schedule = await getRepository(Schedule).findOne({
            where: {
                id: scheduleId
            }
        })
        if (!schedule) throw new ErrorResponse(404, 20, 'El horario no existe')

        const bookings = await getRepository(Booking).find({
            where: {
                Schedule: schedule
            },
            relations: ['Seat', 'User', 'fromPurchase', 'fromPurchase.Bundle', 'User.User_categories', 'User.User_categories.Categories', 'User.User_categories.Categories.User_items']
        })

        let data = []
        for (var i in bookings) {
            const booking = bookings[i]
            data.push({
                id: booking.id,
                name: booking.User.name,
                lastname: booking.User.lastname,
                seat: booking.Seat.number,
                date: schedule.date,
                start: schedule.start,
                end: schedule.end,
                isPass: booking.isPass,
                items: booking.User.User_categories,
                assistance: booking.assistance,
                bundle: booking.fromPurchase.Bundle.name
            })
        }
        return data
    },

    async deleteBookingFromAdmin(bookingId: number, data: DeleteBooking) {

        const booking = await getRepository(Booking).findOne({
            where: {
                id: bookingId
            },
            relations: ['Schedule', 'fromPurchase', 'User', 'fromPurchase.Bundle']
        })
        if (!booking) throw new ErrorResponse(404, 14, 'La reservacion no existe')

        let classesHistory = await getRepository(ClassesHistory).findOne({
            where: {
                User: booking.User
            }
        })

        if (data.discountClass) {
            if (booking.isPass) {
                classesHistory.takenPasses -= 1
            } else if (!booking.isPass && !booking.fromPurchase.Bundle.isGroup) {
                classesHistory.takenClasses -= 1
            } else if (!booking.isPass && booking.fromPurchase.Bundle.isGroup) {
                classesHistory.takenGroupClasses -= 1
            }
            await getRepository(ClassesHistory).save(classesHistory)
            await getRepository(Booking).remove(booking)
        } else {
            let purchase = await getRepository(Purchase).findOne({
                where: {
                    id: booking.fromPurchase.id
                }
            })


            if (booking.isPass) {
                classesHistory.takenPasses -= 1
                purchase.addedPasses += 1
            } else if (!booking.isPass && !booking.fromPurchase.Bundle.isGroup) {
                purchase.addedClasses += 1
                classesHistory.takenClasses -= 1
            } else if (!booking.isPass && booking.fromPurchase.Bundle.isGroup) {
                classesHistory.takenGroupClasses -= 1
                purchase.addedClasses += 1
            }
            /*
            if (booking.isPass) {
                classesHistory.takenPasses -= 1
                purchase.addedPasses += 1
            } else {
                classesHistory.takenClasses -= 1
                purchase.addedClasses += 1
            }*/
            if (!purchase) throw new ErrorResponse(404, 14, 'La compra no existe')

            await getRepository(ClassesHistory).save(classesHistory)
            await getRepository(Purchase).save(purchase)
            await getRepository(Booking).remove(booking)
        }
    },

    async searchBooking(query: string, clientId: string) {
        const bookings = await createQueryBuilder(Booking)
            .leftJoinAndSelect("Booking.Schedule", "Schedule")
            .leftJoinAndSelect("Booking.Seat", "Seat")
            .leftJoinAndSelect("Schedule.Instructor", "Instructor")
            .where("Booking.user_id =:client_Id", { client_Id: clientId })
            .andWhere('Schedule.date like :query or Schedule.start like :query or Schedule.end like :query or Instructor.name like :query or Instructor.lastname like :query ', {
                query: '%' + query + '%',
            })
            .limit(10)
            .getMany()

        for (var i in bookings) {
            delete bookings[i].createdAt
            delete bookings[i].assistance
            delete bookings[i].Schedule.theme
            delete bookings[i].Schedule.isPrivate
            delete bookings[i].Schedule.Instructor.description
            delete bookings[i].Schedule.Instructor.profilePicture
            delete bookings[i].Schedule.Instructor.largePicture
            delete bookings[i].Schedule.Instructor.email
            delete bookings[i].Schedule.Instructor.password
            delete bookings[i].Schedule.Instructor.createdAt
            delete bookings[i].Schedule.Instructor.id
        }
        return bookings
    },

    async getClientBookings(page: string, clientId: string) {
        const pages = parseInt(page) - 1

        let bookings = await createQueryBuilder(Booking)
            .leftJoinAndSelect("Booking.Schedule", "Schedule")
            .leftJoinAndSelect("Booking.Seat", "Seat")
            .leftJoinAndSelect("Schedule.Instructor", "Instructor")
            .where("Booking.user_id =:client_Id", { client_Id: clientId })
            .skip(pages * 10)
            .take(10)
            .orderBy("Schedule.date", "DESC")
            .getMany()

        let pageNumber = await createQueryBuilder(Booking)
            .leftJoinAndSelect("Booking.Schedule", "Schedule")
            .leftJoinAndSelect("Booking.Seat", "Seat")
            .leftJoinAndSelect("Schedule.Instructor", "Instructor")
            .where("Booking.user_id =:client_Id", { client_Id: clientId })
            .orderBy("Schedule.date", "DESC")
            .getCount()

        for (var i in bookings) {
            delete bookings[i].createdAt
            delete bookings[i].assistance
            delete bookings[i].Schedule.theme
            delete bookings[i].Schedule.isPrivate
            delete bookings[i].Schedule.Instructor.description
            delete bookings[i].Schedule.Instructor.profilePicture
            delete bookings[i].Schedule.Instructor.largePicture
            delete bookings[i].Schedule.Instructor.email
            delete bookings[i].Schedule.Instructor.password
            delete bookings[i].Schedule.Instructor.createdAt
            delete bookings[i].Schedule.Instructor.id
        }
        return { bookings, pageNumber }
    },

}