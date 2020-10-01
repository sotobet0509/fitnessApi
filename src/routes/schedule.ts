import { Router } from 'express'
import * as h from 'express-async-handler'
import { ScheduleController } from '../controllers/schedule'
import {checkToken} from '../middleware/CheckToken'


const ScheduleRouter = Router({ mergeParams: true })

/**
 * @swagger
 * /schedules/{scheduleid}:
 *   get:
 *     description: Obtiene los datos de un horario con asientos y reservaciones
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: Consulta correcta
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1 
 *               date:
 *                type: string
 *                example: 2020-09-29T16:46:35.000Z 
 *               end:
 *                 type: string
 *                 example: 12:00:00
 *               start:
 *                 type: string
 *                 example: 11:00:00
 *               Booking:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     Seat:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         number:
 *                           type: string
 *                           example: A1  
 *       500:
 *         description: Server error
 */
ScheduleRouter.get('/:scheduleId', h(ScheduleController.getSchedule))

ScheduleRouter.post('/:schedule_id/seat/:seat_id/client/:client_id',h(checkToken), h(ScheduleController.booking))

export { ScheduleRouter }