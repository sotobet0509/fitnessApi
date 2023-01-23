import { Router } from 'express'

import * as h from 'express-async-handler'
import {checkToken} from '../middleware/CheckToken'
import { AdminController } from '../controllers/admin'
import { CataloguesController } from '../controllers/catalogue'

const CataloguesRouter = Router({ mergeParams: true })


CataloguesRouter.get('/series', h(CataloguesController.getSeries))
CataloguesRouter.get('/exercisesByCategory/:categoria',h(CataloguesController.getExercisesByCategory))
CataloguesRouter.get('/repetitions',h(CataloguesController.getRepetitions))
CataloguesRouter.get('/rest',h(CataloguesController.getRest))
CataloguesRouter.get('/categories',h(CataloguesController.getCategories))
export { CataloguesRouter }