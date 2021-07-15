import { Router } from 'express'
import { AuthController } from '../controllers/auth'
import * as h from 'express-async-handler'
import { checkToken } from '../middleware/CheckToken'

const AuthRouter = Router({ mergeParams: true })

AuthRouter.get('/verify/:mail', h(AuthController.verifyEmail))

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

/**
 * @swagger
 * /auth/google:
 *   post:
 *     description: Registrarse con facebook
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
 *           gooleId:
 *            type: string
 *            required: true
 *           googleToken:
 *            type: string
 *            required: true
 *           email:
 *            type: string
 *            required: true
 *           name:
 *            type: string
 *            required: true
 *           lastname:
 *            type: string
 *            required: true
 *           pictureUrl:
 *            type: string
 *            required: true
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *       500:
 *         description: Server error
 */
AuthRouter.post('/google', h(AuthController.google))

/**
 * @swagger
 * /auth/facebook:
 *   post:
 *     description: Registrarse con facebook
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
 *           facebookId:
 *            type: string
 *            required: true
 *           facebookToken:
 *            type: string
 *            required: true
 *           email:
 *            type: string
 *            required: true
 *           name:
 *            type: string
 *            required: true
 *           lastname:
 *            type: string
 *            required: true
 *           pictureUrl:
 *            type: string
 *            required: true
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *       500:
 *         description: Server error
 */
AuthRouter.post('/facebook', h(AuthController.facebook))

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     description: Registrarse de manera local
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
 *           password:
 *            type: string
 *            required: true
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *       500:
 *         description: Server error
 */
AuthRouter.post('/signup', h(AuthController.signUp))

AuthRouter.post('/colaborador', h(AuthController.loginColaborador))

AuthRouter.post('/instructor', h(AuthController.loginInstructor))

AuthRouter.patch('/recovery-password', h(AuthController.recoveryPassword))

AuthRouter.patch('/change-password', h(AuthController.changePassword))

AuthRouter.patch('/change-password-manual', h(checkToken), h(AuthController.changePasswordManual))

export { AuthRouter }