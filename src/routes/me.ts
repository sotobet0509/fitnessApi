import { Router } from 'express'
import { MeController } from '../controllers/me'
import * as h from 'express-async-handler'
import {checkToken} from '../middleware/CheckToken'

const MeRouter = Router({ mergeParams: true })

/**
 * @swagger
 * /me/:
 *   get:
 *     description: Obtiene los datos de un usuario logueado (requiere token)
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
 *               type: string
 *               example: af3c57a3-82d2-40eb-a360-db603a661c41
 *             name:
 *              type: string
 *              example: joel   
 *             email:
 *               type: string
 *               example: joel@dominio.com
 *             lastname:
 *               type: string
 *               example: pintor
 *             picturUrl:
 *               type: string
 *               example: ruta/pictureUrl
 *             facebookId:
 *               type: string
 *               example: null
 *             googleId:
 *               type: string
 *               example: null
 *             tempToken:
 *               type: string
 *               example: null        
 *       500:
 *         description: Server error
 */
MeRouter.get('/', h(checkToken), h(MeController.profile))

MeRouter.get('/classes', h(checkToken), h(MeController.classes))

/**
 * @swagger
 * /me/history:
 *   get:
 *     description: Obtiene el historial de compras del usuario (requiere token)
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: Consulta correcta
 *         schema:
 *           type: object
 *           properties:
 *             purchases:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                  id:
 *                    type: integer
 *                    example: 1
 *                  date:
 *                    type: string
 *                    example: 2020-09-01T16:18:28.000Z
 *                  Bundle:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: integer
 *                        example: 1
 *                      name:
 *                        type: string
 *                        example: paquetaxo  
 *                      price:
 *                        type: integer
 *                        example: 100
 *                      offer:
 *                        type: integer
 *                        example: 90
 *                      description:
 *                        type: string
 *                        example: paquete para empezar
 *                      classnumber:
 *                        type: integer
 *                        example: 1
 *                      expirationDays:
 *                        type: integer
 *                        example: 7
 *                      passes:
 *                        type: integer
 *                        example: 1
 *                      isDeleted:
 *                        type: boolean
 *                        example: false
 *                      isRecurrent:
 *                        type: boolean       
 *       500:
 *         description: Server error
 */
MeRouter.get('/history', h(checkToken), h(MeController.history))

MeRouter.get('/items', h(checkToken), h(MeController.getItems))

MeRouter.get('/items/:item_id', h(checkToken), h(MeController.getItemCategories))

MeRouter.get('/all/items', h(checkToken), h(MeController.getAllItems))

MeRouter.get('/member/list', h(checkToken), h(MeController.getMembers))

MeRouter.patch('/changeProfilePicture', h(checkToken), h(MeController.uploadProfilePicture))

MeRouter.patch('/', h(checkToken), h(MeController.editUsers))

MeRouter.patch('/items', h(checkToken), h(MeController.editItems))

MeRouter.patch('/member/remove', h(checkToken), h(MeController.removeMember))

MeRouter.patch('/member/invite', h(checkToken), h(MeController.inviteMember))

MeRouter.patch('/member/name', h(checkToken), h(MeController.changeGroupName))

MeRouter.post('/update/classes-history', h(MeController.updateClassesHistory)) //preguntar

MeRouter.post('/update/pendings', h(MeController.updatePendings)) //preguntar

export { MeRouter }