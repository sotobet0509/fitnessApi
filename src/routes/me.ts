import { Router } from 'express'
import { MeController } from '../controllers/me'
import * as h from 'express-async-handler'
import {checkToken} from '../middleware/CheckToken'

const MeRouter = Router({ mergeParams: true })

MeRouter.patch('/changeProfilePicture', h(checkToken), h(MeController.uploadProfilePicture))
MeRouter.get('/', h(checkToken), h(MeController.profile))
MeRouter.get('/dates',h(checkToken),h(MeController.getDates))
MeRouter.get('/exercises',h(checkToken),h(MeController.getExercises))
MeRouter.post('/upload-activity-picture', h(checkToken), h(MeController.uploadImage))
MeRouter.get('/activity-pictures',h(checkToken),h(MeController.getActivityPictures))
MeRouter.patch('/exercises/mark-exercise-as-completed/:idEjercicio',h(checkToken),h(MeController.markExerciseAsCompleted))
MeRouter.get('/diet',h(checkToken),h(MeController.getDiet))
MeRouter.get('/steps/:fecha',h(checkToken), h(MeController.getSteps))
MeRouter.post('/steps',h(checkToken), h(MeController.postSteps))
MeRouter.patch('/exercises/add-comment/:idEjercicio',h(checkToken), h(MeController.addComment))
MeRouter.get('/getPendingDates',h(checkToken), h(MeController.getPendingDates))
MeRouter.get('/getPendingExercises',h(checkToken), h(MeController.getPendingExercises))
MeRouter.get('/objectives',h(checkToken),h(MeController.getObjectives))
export { MeRouter }