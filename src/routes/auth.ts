import { Router } from 'express'
import { AuthController } from '../controllers/auth'
import * as h from 'express-async-handler'

const AuthRouter = Router({ mergeParams: true })
AuthRouter.post('/signup', h(AuthController.signUp))
AuthRouter.post('/facebook', h(AuthController.facebook))
AuthRouter.post('/google', h(AuthController.google))

/**
 * @swagger
 * /auth/login:
 *   post:
 *     description: Iniciar sesión con correo y contraseña
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
 *           email:
 *            type: string
 *            required: true
 *           password:
 *            type: string
 *            required: true
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *       500:
 *         description: Server error
 */
AuthRouter.post('/login', h(AuthController.login))

export { AuthRouter }