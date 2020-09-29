import { Router } from 'express'
import * as h from 'express-async-handler'
import { ScheduleController } from '../controllers/schedule'
//import {checkToken} from '../middleware/CheckToken'

const ScheduleRouter = Router({ mergeParams: true })
ScheduleRouter.get('/:scheduleId', h(ScheduleController.getSchedule))

export { ScheduleRouter }