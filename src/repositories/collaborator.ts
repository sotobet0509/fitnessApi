import { getRepository } from 'typeorm'
import { Alternate_users } from '../entities/alternateUsers'

export const CollaboratorRepository = {

    async getAllCollaborators() {
       const collaborators = await getRepository(Alternate_users).find()

       return collaborators
    }
}