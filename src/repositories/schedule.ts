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
import { Location } from '../entities/Locantions'
import { Schedule } from '../entities/Schedules'

export const ScheduleRepository = {
    async getSchedule(scheduleId: number){
        const schedule = await getRepository(Schedule).find({
            where: {
                id: scheduleId
            },
            relations: ['Booking','Booking.Seat']
        })
        if (schedule.length == 0) throw new ErrorResponse(404, 13, 'El horario no existe o esta vacio')

        return schedule
    }
}