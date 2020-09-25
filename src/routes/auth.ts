import { Router } from 'express'
import { AuthController } from '../controllers/auth'
import * as h from 'express-async-handler'

const AuthRouter = Router({ mergeParams: true })
AuthRouter.post('/signup', h(AuthController.signUp))
AuthRouter.post('/facebook', h(AuthController.facebook))
AuthRouter.post('/google', h(AuthController.google))

/**
 * @swagger
 * /api/fruits:
 *   post:
 *     tags:
 *       - Fruits
 *     description: Adds a new fruit to the database
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully added
 *       500:
 *         description: Server error
 */
AuthRouter.post('/login', h(AuthController.login))

export { AuthRouter }