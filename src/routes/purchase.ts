import { Router } from 'express'
import * as h from 'express-async-handler'
import { ClientController } from '../controllers/client'
import { PurchaseController } from '../controllers/purchase'
import {checkToken} from '../middleware/CheckToken'


const PurchaseRouter = Router({ mergeParams: true })

/**
 * @swagger
 * /purchase/client/{client_id}:
 *   post:
 *     description: Reliza la compra de un paquete o paquetes para un usuario por id (requiere token de usuario tipo admin)
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
 *           bundles:
 *            type: array
 *            items:
 *              bundleid:
 *              type: integer
 *              required: true
 *            required: true
 *           transactionId:
 *            type: string
 *            required: true
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *       500:
 *         description: Server error
 */
PurchaseRouter.post('/client/:client_id', h(checkToken), h(PurchaseController.buy))

export { PurchaseRouter }