import { Router } from 'express'
import { BundleController } from '../controllers/bundle'
import * as h from 'express-async-handler'
import { checkToken } from '../middleware/CheckToken'


const BundleRouter = Router({ mergeParams: true })

/**
 * @swagger
 * /bundles:
 *   get:
 *     description: Obtiene los datoproduces:s de todos los paquetes
 *     
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
 *                 type: string
 *                 example: paquetaxo  
 *               price:
 *                 type: integer
 *                 example: 100
 *               offer:
 *                 type: integer
 *                 example: 90
 *               description:
 *                 type: string
 *                 example: paquete para empezar
 *               classnumber:
 *                 type: integer
 *                 example: 1
 *               expirationDays:
 *                 type: integer
 *                 example: 7
 *               passes:
 *                 type: integer
 *                 example: 1
 *               isDeleted:
 *                 type: boolean
 *                 example: false
 *               isRecurrent:
 *                 type: boolean 
 *                 example: false
 *               isUnlimited:
 *                 type: boolean 
 *                 example: false 
 *       500:
 *         description: Server error
 */
BundleRouter.get('/', h(BundleController.getAllBundles))

/**
 * @swagger
 * /bundles/{bundle_id}:
 *   get:
 *     description: Obtiene los datos de un paquete por id
 *     produces:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *         description: Consulta correcta
 *         schema:
*            properties:
*              id:
*                type: integer
*                example: 1 
*              name:
*                type: string
*                example: paquetaxo  
*              price:
*                type: integer
*                example: 100
*              offer:
*                type: integer
*                example: 90
*              description:
*                type: string
*                example: paquete para empezar
*              classnumber:
*                type: integer
*                example: 1
*              expirationDays:
*                type: integer
*                example: 7
*              passes:
*                type: integer
*                example: 1
*              isDeleted:
*                type: boolean
*                example: false
*              isRecurrent:
*                type: boolean 
*                example: false 
*              isUnlimited:
*                type: boolean 
*                example: false     
 *       500:
 *         description: Server error
 */

BundleRouter.get('/:bundle_id', h(BundleController.getBundle))

BundleRouter.get('/discount/all', h(BundleController.getAllDiscounts))

BundleRouter.patch('/updateall', h(BundleController.updatePasses))

BundleRouter.post('/create',h(checkToken), h(BundleController.createBundle))

BundleRouter.patch('/activate/:bundle_id',h(checkToken), h(BundleController.changeBundleStatus))

BundleRouter.patch('/edit/:bundle_id',h(checkToken), h(BundleController.updateBundle))

export { BundleRouter }