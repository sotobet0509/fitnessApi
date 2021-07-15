import { Router } from 'express'
import * as h from 'express-async-handler'
import { ClientController } from '../controllers/client'
import { PurchaseController } from '../controllers/purchase'
import { checkToken } from '../middleware/CheckToken'


const PurchaseRouter = Router({ mergeParams: true })

PurchaseRouter.get('/all',h(checkToken), h(PurchaseController.getAllPurchases))

PurchaseRouter.get('/search/:query',h(checkToken), h(PurchaseController.searchPurchase))

PurchaseRouter.get('/search/:clientId/:query',h(checkToken), h(PurchaseController.searchClientPurchase))

PurchaseRouter.get('/client/:clientId',h(checkToken), h(PurchaseController.getClientPurchases))

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

PurchaseRouter.post('/createSession', h(PurchaseController.createSession))

PurchaseRouter.post('/init',h(checkToken), h(PurchaseController.inicializePurchase))

PurchaseRouter.patch('/buy/:operationId', h(checkToken), h(PurchaseController.buyClient))

PurchaseRouter.patch('/update/:purchase_id/bundle/:bundle_id', h(checkToken), h(PurchaseController.upgradeBundle))

PurchaseRouter.patch('/client/:client_id/purchase/:purchase_id', h(checkToken), h(PurchaseController.buyExtra))

PurchaseRouter.patch('/updateall', h(checkToken), h(PurchaseController.updateAll))

PurchaseRouter.patch('/update-expiration-date',h(checkToken), h(PurchaseController.updateExpiarationDate))

PurchaseRouter.patch('/complete/:purchaseId',h(checkToken), h(PurchaseController.completePurchase))

PurchaseRouter.patch('/cancel/:purchaseId',h(checkToken), h(PurchaseController.setCancelStatus))

PurchaseRouter.patch('/erase/oldPendingPurchases',h(checkToken), h(PurchaseController.eraseOldPendingPurchases))

PurchaseRouter.delete('/:purchase_id', h(checkToken), h(PurchaseController.cancelPurchase))

export { PurchaseRouter }