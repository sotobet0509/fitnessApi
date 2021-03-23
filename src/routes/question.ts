import { Router } from 'express'
import * as h from 'express-async-handler'
import { QuestionController } from '../controllers/question'
import { checkToken } from '../middleware/CheckToken'

const QuestionRouter = Router({ mergeParams: true })

QuestionRouter.post('/',h(checkToken), h(QuestionController.saveQuestionary))

export { QuestionRouter }