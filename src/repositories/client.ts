import { getRepository, getConnection, Repository } from 'typeorm'
import { ErrorResponse } from '../errors/ErrorResponse'
import { User } from '../entities/Users'
import { CustomerData } from '../interfaces/auth'

export const ClientRepository = {
    async getAllClients(){
        const clients = await getRepository(User).find({
            where:{
                isAdmin: false
            }
        })
        clients.forEach((client: User)=>{
            delete client.password
        })
        return clients

    },
    
    async getClient(clientId: string){
        const client = await getRepository(User).findOne({
            where: {
                id: clientId
            }
        })
        if (!client) throw new ErrorResponse(404, 14, 'El cliente no existe')
        delete client.password
        return client
    },

    async createClient(data: CustomerData){
        const clientRepository = getRepository(User)
        //Revisar si existe ese email
        const exists = await clientRepository.findOne({
          where: {
            email: data.email,
          },
        })
    
        if (exists) throw new ErrorResponse(403, 6, 'Email already registered')
    
        let client = new User()
        client.email = data.email
        client.name = data.name
        client.lastname = data.lastname
      
        //Save
        client = await clientRepository.save(client)
    
        //await sendActivationUrl(client.email, client.tempToken)
        return client
    } 

}