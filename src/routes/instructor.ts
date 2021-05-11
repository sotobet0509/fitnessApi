import { Router } from 'express'
import * as h from 'express-async-handler'
import { InstructorController } from '../controllers/instructor'
import { checkToken } from '../middleware/CheckToken'


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

InstructorRouter.get('/list/all', h(InstructorController.getVisibleInstructors))

/**
 * @swagger
 * /instructors/create:
 *   post:
 *     description: Crear un nuevo instructor
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
 *           name:
 *            type: string
 *            required: true
 *           lastname:
 *            type: string
 *            required: true
 *           description:
 *            type: string
 *            required: true
 *           profilePicture:
 *            type: string
 *            required: true
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *       500:
 *         description: Server error
 */
InstructorRouter.post('/create',h(checkToken), h(InstructorController.createInstructor))

InstructorRouter.patch('/update',h(checkToken), h(InstructorController.updateInstructor))

InstructorRouter.patch('/delete/:instructor_id',h(checkToken), h(InstructorController.deleteInstructor))

InstructorRouter.patch('/changeProfilePicture/:instructor_id',h(checkToken), h(InstructorController.changeInstructorProfilePicture))

InstructorRouter.patch('/reassign/:instructorId',h(checkToken), h(InstructorController.reassignInstructor))


export { InstructorRouter }