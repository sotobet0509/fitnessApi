import { getRepository, getConnection, Repository } from 'typeorm'
import * as moment from 'moment'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Room } from '../entities/Rooms'

export const RoomRepository = {

    async getAllRooms() {
       const rooms = await getRepository(Room).find()
       return rooms
    }
}