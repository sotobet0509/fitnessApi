import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Instructor } from '../entities/Instructors'
import { InstructorController } from '../controllers/instructor'
import { InstructorSchema } from '../interfaces/instructor'

export const InstructorRepository = {
    async getInstructor(instructorId: number){
        const instructor = await getRepository(Instructor).findOne({
            where: {
                id: instructorId
            }
        })
        if (!instructor) throw new ErrorResponse(404, 14, 'El instructor no existe')
        return instructor
    },

    async getAllInstructors(){
        const instructors = await getRepository(Instructor).find({})
        return instructors

    },

    async createInstructor(data: InstructorSchema) {
        const instructorRepository = getRepository(Instructor)
        
        let instructor = new Instructor()
        instructor.name = data.name
        instructor.lastname = data.lastname
        instructor.description = data.description
        instructor.profilePicture = data.profilePicture

        instructor = await instructorRepository.save(instructor)

        return instructor
    }

}