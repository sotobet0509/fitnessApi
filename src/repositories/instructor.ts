import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Instructor } from '../entities/Instructors'

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

    }

}