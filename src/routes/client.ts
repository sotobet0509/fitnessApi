import { Router } from 'express'
import * as h from 'express-async-handler'
import { ClientController } from '../controllers/client'
import {checkToken} from '../middleware/CheckToken'


const ClientRouter = Router({ mergeParams: true })

/**
 * @swagger
 * /clients/:
 *   get:
 *     description: Obtiene los datos de todos los usuarios (requiere token de usuario admin)
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
 *               client:
 *                 type: object
 *                 properties: 
 *                   id:
 *                     type: string
 *                     example: af3c57a3-82d2-40eb-a360-db603a661c41
 *                   name:
 *                     type: string
 *                     example: joel   
 *                   email:
 *                     type: string
 *                     example: joel@dominio.com
 *                   lastname:
 *                     type: string
 *                     example: pintor
 *                   picturUrl:
 *                     type: string
 *                     example: ruta/pictureUrl
 *                   facebookId:
 *                     type: string
 *                     example: null
 *                   googleId:
 *                     type: string
 *                     example: null
 *                   tempToken:
 *                     type: string
 *                     example: null   
 *                   isAdmin:
 *                     type: boolen
 *                     example: false
 *                   isDeleted:
 *                     type: boolean
 *                     example: false
 *                   createdAt:
 *                     type: string
 *                     example: 2020-10-05T07:03:32.138Z   
 *                   Booking:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         isPass:
 *                           type: boolean
 *                           example: false
 *                         createdAt:  
 *                           type: string
 *                           example: 2020-10-05T07:03:32.138Z
 *                         fromPurchase:
 *                           type: integer
 *                           example: 36
 *                         schedule:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 25
 *                             date:   
 *                               type: string
 *                               example: 2020-10-05T07:03:32.138Z
 *                             end:
 *                               type: string
 *                               example: 10:00:00
 *                             start:
 *                               type: string
 *                               example: 09:15:00            
 *               pending:
 *                 type: integer
 *                 example: 0             
 *               taken:           
 *                 type: integer              
 *                 example: 1
 *               pendingPasses:
 *                 type: integer
 *                 example: 0
 *               takenPasses:
 *                 type: integer
 *                 example: 0
 *               isUnlimited:
 *                 type: boolean
 *                 example: false        
 *       500:
 *         description: Server error
 */
ClientRouter.get('/', h(checkToken), h(ClientController.getAllClients))

/**
 * @swagger
 * /clients/{client_id}:
 *   get:
 *     description: Obtiene los datos de un usuario por id (requiere token de usuario admin)
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
 *             isAdmin:
 *               type: boolen
 *               example: false      
 *       500:
 *         description: Server error
 */
ClientRouter.get('/:client_id',  h(checkToken), h(ClientController.getClient))

ClientRouter.get('/member/client/:client_id',h(checkToken), h(ClientController.getMembers))

ClientRouter.get('/member/list',h(checkToken), h(ClientController.getAllMembers))

ClientRouter.get('/search/:query',h(checkToken), h(ClientController.searchClient))

/**
 * @swagger
 * /clients/:
 *   post:
 *     description: Crear un nuevo cliente desde el administrador (requiere token de usuario tipo admin)
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
 *           email:
 *            type: string
 *            required: true
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *       500:
 *         description: Server error
 */
 ClientRouter.post( '/', h(checkToken), h(ClientController.createClient))

ClientRouter.patch('/update',h(checkToken), h(ClientController.updateClient))

ClientRouter.patch('/delete/:client_id',h(checkToken), h(ClientController.changeClientStatus))

ClientRouter.patch('/member/remove/:client_id',h(checkToken), h(ClientController.removeMember))

ClientRouter.patch('/member/:email',h(checkToken), h(ClientController.inviteClientToGroup))

ClientRouter.patch('/member/name/:client_id',h(checkToken), h(ClientController.renameGroup))

export { ClientRouter }