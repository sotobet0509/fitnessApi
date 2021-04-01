import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Instructor } from '../entities/Instructors'
import { InstructorSchema } from '../interfaces/instructor'

export const InstructorRepository = {
    async getInstructor(instructorId: number) {
        const instructor = await getRepository(Instructor).findOne({
            where: {
                id: instructorId
            }
        })
        if (!instructor) throw new ErrorResponse(404, 14, 'El instructor no existe')
        return instructor
    },

    async getAllInstructors() {
        const instructors = await getRepository(Instructor).find({
            isDeleted: false
        })
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

    async changeInstructorStatus(instructorId: number) {
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
    async getAllInstructorsWithDeleted() {
        const instructors = await getRepository(Instructor).find({

        })
        if (!instructors) throw new ErrorResponse(404, 40, 'No hay instructores registrados')
        return instructors
    },

}