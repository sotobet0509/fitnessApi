import { Router } from 'express'
import * as h from 'express-async-handler'
import { InstructorController } from '../controllers/instructor'


const InstructorRouter = Router({ mergeParams: true })
InstructorRouter.get('/:instructor_id', h(InstructorController.getInstructor))
InstructorRouter.get('/', h(InstructorController.getAllInstructors))

export { InstructorRouter }