import { Router } from 'express'
import * as h from 'express-async-handler'
import {checkToken} from '../middleware/CheckToken'

import { AdminController } from '../controllers/admin'

const AdminRouter = Router({ mergeParams: true })

AdminRouter.patch('/changeProfilePicture', h(checkToken), h(AdminController.uploadProfilePicture))
AdminRouter.get('/', h(checkToken), h(AdminController.profile))
AdminRouter.get('/patients',h(checkToken),h(AdminController.getPatients))
AdminRouter.get('/patients/:idUsuario',h(checkToken),h(AdminController.getPatientById))
AdminRouter.get('/patients/progress/:idUsuario',h(checkToken),h(AdminController.getPatientProgress))
AdminRouter.get('/patients/pictures/:idUsuario',h(checkToken),h(AdminController.getPatientPictures))
AdminRouter.patch('/patients/activate-exercises/:idUsuario', h(checkToken), h(AdminController.activateExercises))
AdminRouter.post('/patients/set-exercise/:idUsuario',h(checkToken),h(AdminController.setExercise))
AdminRouter.get('/dates',h(checkToken),h(AdminController.getAllDates))
AdminRouter.get('/patients/dates/:id',h(checkToken),h(AdminController.getSingleDate))
AdminRouter.post('/patients/set-date/:idUsuario',h(checkToken),h(AdminController.setDate))
AdminRouter.post('/upload-activity-picture/:idUsuario', h(checkToken), h(AdminController.uploadImage))
AdminRouter.post('/patients/progress/:idUsuario',h(checkToken),h(AdminController.postPatientProgress))
AdminRouter.post('/diets/uploadDiet/:idUsuario',h(checkToken),h(AdminController.uploadDiet))
AdminRouter.patch('/patients/change-status/:idUsuario', h(checkToken), h(AdminController.changePatientStatus))
AdminRouter.get('/patients/exercises/:idUsuario/:fecha',h(checkToken), h(AdminController.getPatientExercises))
export { AdminRouter }