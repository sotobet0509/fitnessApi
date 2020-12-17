import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { CollaboratorRepository } from '../repositories/collaborator'
import { ErrorResponse } from '../errors/ErrorResponse'

export const CollaboratorController ={

    async getAllCollaborators(req: ExtendedRequest, res: Response){
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const collaborators = await CollaboratorRepository.getAllCollaborators()
        res.json({ success: true, data: collaborators})
    },

    
}