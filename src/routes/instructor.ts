import { Router } from 'express'
import * as h from 'express-async-handler'
import { InstructorController } from '../controllers/instructor'


const InstructorRouter = Router({ mergeParams: true })


/**
 * @swagger
 * /instructors:
 *   get:
 *     description: Obtiene los datos de todos los instructores
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
 *                example: jafet   
 *               lastname:
 *                 type: string
 *                 example: cruz
 *               description:
 *                 type: string
 *                 example: entrena duro
 *               profilePicture:
 *                 type: string
 *                 example: ruta/profilePicurte
 *               largePicture:
 *                 type: string
 *                 example: ruta/largePicurte     
 *       500:
 *         description: Server error
 */
InstructorRouter.get('/', h(InstructorController.getAllInstructors))

/**
 * @swagger
 * /instructors/{instructor_id}:
 *   get:
 *     description: Obtiene los datos de un instructor por id
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
 *              type: string
 *              example: jafet   
 *             lastname:
 *               type: string
 *               example: cruz
 *             description:
 *               type: string
 *               example: entrena duro
 *             profilePicture:
 *               type: string
 *               example: ruta/profilePicurte
 *             largePicture:
 *               type: string
 *               example: ruta/largePicurte     
 *       500:
 *         description: Server error
 */
InstructorRouter.get('/:instructor_id', h(InstructorController.getInstructor))

export { InstructorRouter }