import { getRepository, getConnection, Repository, createQueryBuilder } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Instructor } from '../entities/Instructors'
import { InstructorSchema } from '../interfaces/instructor'
import { Schedule } from '../entities/Schedules'
import moment = require('moment')

export const InstructorRepository = {
    async getInstructor(instructorId: number) {
        let exists = false
        const instructor = await getRepository(Instructor).findOne({
            where: {
                id: instructorId
            }
        })
        if (!instructor) throw new ErrorResponse(404, 14, 'El instructor no existe')
        delete instructor.password
        let currentDate = moment().tz("America/Mexico_City")
        const scheduleExist = await createQueryBuilder(Schedule)
            .innerJoinAndSelect('Schedule.Instructor', 'Instructor')
            .where('Schedule.Instructor=:instructorId', { instructorId: instructor.id })
            .andWhere('Date(date)>=:cDate', { cDate: moment(currentDate).format('YYYY-MM-DD') })
            //.andWhere('Time(end)>:cTime', { cTime: moment(currentDate).format("HH:mm:ss") })
            .orderBy("date", "ASC")
            .getMany()

        const currentTime = moment(currentDate).format('HH:mm:ss')

        for (var i in scheduleExist) {
            if (moment(scheduleExist[i].date).isSame(moment(currentDate).format('YYYY-MM-DD'))) {
                const scheduleStart = moment(moment(currentDate).format('YYYY-MM-DD') + ' ' + scheduleExist[i].start).format('HH:mm:ss')
                if (scheduleStart >= currentTime) {
                    exists = true
                    break
                }
            } else {
                exists = true
                break
            }
        }

        return { ...instructor, "scheduleExists": exists }
    },

    async getAllInstructors() {

        const instructors = await getRepository(Instructor).find({
            where: {
                isVisible: true
            }

        })

        for (var i in instructors) {
            delete instructors[i].password
            delete instructors[i].email
        }
        return instructors
    },

    async createInstructor(data: InstructorSchema) {
        const instructorRepository = getRepository(Instructor)

        let instructor = new Instructor()
        instructor.name = data.name
        instructor.lastname = data.lastname
        instructor.description = data.description
        instructor.profilePicture = data.profilePicture
        instructor.largePicture = data.largePicture
        instructor.isDeleted = false

        instructor = await instructorRepository.save(instructor)

        return instructor
    },

    async updateInstructor(data: InstructorSchema) {
        const instructorRepository = getRepository(Instructor)
        const updateInstructor = await getRepository(Instructor).findOne({
            where: {
                id: data.id
            }
        })
        if (!updateInstructor) throw new ErrorResponse(404, 14, 'El instructor no existe')

        updateInstructor.name = data.name ? data.name : updateInstructor.name
        updateInstructor.lastname = data.lastname ? data.lastname : updateInstructor.lastname
        updateInstructor.description = data.description ? data.description : updateInstructor.description
        updateInstructor.profilePicture = data.profilePicture ? data.profilePicture : updateInstructor.profilePicture
        updateInstructor.largePicture = data.largePicture ? data.largePicture : updateInstructor.largePicture
        updateInstructor.isDeleted = updateInstructor.isDeleted
        updateInstructor.createdAt = updateInstructor.createdAt
        await instructorRepository.save(updateInstructor)
    },

    async changeisDeletedInstructor(instructorId: number) {
        const instructorRepository = getRepository(Instructor)

        const instructor = await getRepository(Instructor).findOne({
            where: {
                id: instructorId
            }
        })
        if (!instructor) throw new ErrorResponse(404, 14, 'El instructor no existe')


        instructor.isDeleted = !instructor.isDeleted
        await instructorRepository.save(instructor)

    },

    async changeInstructorProfilePicture(url: string, instructorId: number) {
        const InstructorRepository = getRepository(Instructor)
        const instructor = await getRepository(Instructor).findOne({
            where: {
                id: instructorId
            }
        })
        if (!instructor) throw new ErrorResponse(404, 14, 'El instructor no existe')
        instructor.profilePicture = url

        await InstructorRepository.save(instructor)
    },

    async getVisibleInstructors() {
        const instructors = await getRepository(Instructor).find({
            where: {
                isDeleted: false,
            }
        })

        for (var i in instructors) {
            delete instructors[i].password
            delete instructors[i].email
            delete instructors[i].createdAt
            delete instructors[i].isDeleted
            delete instructors[i].profilePicture
            delete instructors[i].largePicture
        }

        if (!instructors) throw new ErrorResponse(404, 40, 'No hay instructores registrados')
        return instructors
    },

    //reasignInstructor


    async reassignInstructor(data: InstructorSchema, instructorId: number) {
        const currentInstructor = await getRepository(Instructor)
            .findOne({
                where: {
                    id: instructorId
                }
            })
        if (!currentInstructor) throw new ErrorResponse(403, 14, 'El instructor no existe')
        const newInstructor = await getRepository(Instructor)
            .findOne({
                where: {
                    id: data.id
                }
            })
        if (!newInstructor) throw new ErrorResponse(403, 14, 'El instructor no existe')

        let currentDate = moment().tz("America/Mexico_City")
        const schedules = await createQueryBuilder(Schedule)
            .innerJoinAndSelect('Schedule.Instructor', 'Instructor')
            .where('Schedule.Instructor=:instructorId', { instructorId: currentInstructor.id })
            .andWhere('Date(date)>=:cDate', { cDate: moment(currentDate).format('YYYY-MM-DD') })
            .getMany()

        /* for (var schedule in schedules) {
               schedules[schedule].Instructor = newInstructor
               await getRepository(Schedule).save(schedules[schedule])
           }*/



        const currentTime = moment(currentDate).format('HH:mm:ss')
        for (var i in schedules) {
            if (moment(schedules[i].date).isSame(moment(currentDate).format('YYYY-MM-DD'))) {
                const scheduleStart = moment(moment(currentDate).format('YYYY-MM-DD') + ' ' + schedules[i].start).format('HH:mm:ss')
                if (scheduleStart >= currentTime) {
                    schedules[i].Instructor = newInstructor
                    await getRepository(Schedule).save(schedules[i])
                }
            } else {
                schedules[i].Instructor = newInstructor
                await getRepository(Schedule).save(schedules[i])
            }
        }

    },


}