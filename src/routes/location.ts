import { Router } from 'express'
import { BundleController } from '../controllers/bundle'
import * as h from 'express-async-handler'
import { LocationController } from '../controllers/location'
import { checkToken } from '../middleware/CheckToken'
//import {checkToken} from '../middleware/CheckToken'

const LocationRouter = Router({ mergeParams: true })


/**
 * @swagger
 * /locations:
 *   get:
 *     description: Obtiene los datos de todas las locaciones
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
 *               name:
 *                type: string
 *                example: edificio 1  
 *               address:
 *                 type: string
 *                 example: calle falsa #130 colonia no existe
 *       500:
 *         description: Server error
 */
LocationRouter.get('/', h(LocationController.getAllLocations))

/**
 * @swagger
 * /locations/{location:id}:
 *   get:
 *     description: Obtiene todos los cuartos que corresponden al id de una locación
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: Consulta correcta
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1 
 *             name:
 *               type: string
 *               example: edificio 1  
 *             address:
 *               type: string
 *               example: calle falsa #130 colonia no existe
 *             Room:
 *               type: array
 *               items:
 *                 type: object
 *                 properties: 
 *                   id:
 *                     type: integer
 *                     example: 1 
 *                   name:
 *                     type: string
 *                     example: cuarto 1  
 *                   description:
 *                     type: string
 *                     example: el primer cuarto del edificio
 *       500:
 *         description: Server error
 */
LocationRouter.get('/:location_id', h(LocationController.getLocation))

LocationRouter.get('/room/:room_id/year/:year/month/:month/week/:week', h(LocationController.getLocationsByWeek))

LocationRouter.get('/schedules/all',h(checkToken), h(LocationController.getSchedules))

export { LocationRouter }