import { Router } from 'express'
import * as h from 'express-async-handler'
import { CollaboratorController } from '../controllers/collaborator'
import { checkToken } from '../middleware/CheckToken'

const CollaboratorRouter = Router({ mergeParams: true })

CollaboratorRouter.get('/',h(checkToken) ,h(CollaboratorController.getAllCollaborators))

export { CollaboratorRouter }
