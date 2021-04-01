import { Request, Response } from 'express'
import { ExtendedRequest } from '../../types'
import { RoomRepository } from '../repositories/room'

export const RoomController ={

    async getAllRooms(req: ExtendedRequest, res: Response){
        const Rooms = await RoomRepository.getAllRooms()
        res.json({ success: true, data: Rooms})
    }  
}