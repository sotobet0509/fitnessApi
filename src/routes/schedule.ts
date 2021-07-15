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

ScheduleRouter.get('/client/:scheduleId',h(checkToken), h(ScheduleController.getClientSchedule))

ScheduleRouter.get('/search/:query',h(checkToken), h(ScheduleController.searchSchedule))

/**
 * @swagger
 * /schedules/{schedule_id}/seat/{seat_id}/client/{client_id}:
 *   post:
 *     description: Reliza la reservacion de un asiento en un horario para un usuario por id (requiere token de usuario tipo admin)
 *     security:
 *      - ApiKeyAuth:
 *        type: apiKey
 *        in: header
 *        name: Authorization
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *          type: object
 *          properties:
 *           scheduleid:
 *             type: integer
 *             required: true
 *           seatId:
 *             type: integer
 *             required: true
 *           clientId:
 *             type: string
 *             required: true 
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *       500:
 *         description: Server error
 */
ScheduleRouter.post('/:schedule_id/seat/:seat_id/client/:client_id',h(checkToken), h(ScheduleController.booking))

ScheduleRouter.post('/:schedule_id/seat/:seat_id',h(checkToken), h(ScheduleController.bookingClient))

ScheduleRouter.post('/:schedule_id/seat/:seat_id/member',h(checkToken), h(ScheduleController.bookingClientGroupByAdmin))

ScheduleRouter.post('/:schedule_id/seat/:seat_id/client/:client_id/member',h(checkToken), h(ScheduleController.bookingClientGroup))

/**
 * @swagger
 * /schedules/create:
 *   post:
 *     description: Crear un nuevo horario (el campo start y end requieren una fecha la inicio la cual no se guarda)
 *     security:
 *      - ApiKeyAuth:
 *        type: apiKey
 *        in: header
 *        name: Authorization
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *          type: object
 *          properties:
 *           date:
 *            type: string
 *            required: true
 *           end:
 *            type: string
 *            required: true
 *           start:
 *            type: string
 *            required: true
 *           instructor_id:
 *            type: string
 *            required: true
 *           roomsId:
 *            type: string
 *            required: true
 * 
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *       500:
 *         description: Server error
 */
ScheduleRouter.post('/create',h(checkToken), h(ScheduleController.createSchedule))

ScheduleRouter.patch('/update',h(checkToken), h(ScheduleController.updateSchedule))

ScheduleRouter.patch('/assistance/:booking_id',h(checkToken), h(ScheduleController.setAssistance))

ScheduleRouter.delete('/:schedule_id',h(checkToken), h(ScheduleController.deleteSchedule))


export { ScheduleRouter }