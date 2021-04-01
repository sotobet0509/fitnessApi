import { getRepository } from 'typeorm'
import { Room } from '../entities/Rooms'

export const RoomRepository = {

    async getAllRooms() {
       const rooms = await getRepository(Room).find()
       return rooms
    }
}