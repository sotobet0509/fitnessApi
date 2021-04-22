import { Router } from 'express'
import * as h from 'express-async-handler'
import { Survey1Controller } from '../controllers/survey1'
import { checkToken } from '../middleware/CheckToken'

const Survey1Router = Router({ mergeParams: true })

Survey1Router.post('/',h(checkToken), h(Survey1Controller.saveSurvey1))

export { Survey1Router }