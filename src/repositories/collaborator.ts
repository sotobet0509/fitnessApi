import * as moment from 'moment'
import { getRepository } from 'typeorm'
import { Alternate_users } from '../entities/alternateUsers'
import { ErrorResponse } from '../errors/ErrorResponse'


export const CollaboratorRepository = {

    async getAllCollaborators() {
       const collaborators = await getRepository(Alternate_users).find()

       return collaborators
    }
}