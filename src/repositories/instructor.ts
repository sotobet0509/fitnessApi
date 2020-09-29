import { getRepository, getConnection, Repository } from 'typeorm'
import { User } from '../entities/Users'
import { TokenService } from '../services/token'
import { ErrorResponse } from '../errors/ErrorResponse'
import { getParsedCommandLineOfConfigFile } from 'typescript'
import { Purchase } from '../entities/Purchases'
import { Bundle } from '../entities/Bundles'
import { Payment_method } from '../entities/Payment_methods'
import { Booking } from '../entities/Bookings'
import { build } from 'swagger-express-ts'
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