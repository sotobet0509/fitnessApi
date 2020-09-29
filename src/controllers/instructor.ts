import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { InstructorRepository } from '../repositories/instructor'

export const InstructorController ={

    async getInstructor(req: ExtendedRequest, res: Response){
        const instructorId = parseInt(req.params.instructor_id)
        const instructor = await InstructorRepository.getInstructor(instructorId)
        res.json({ success: true, data: instructor})
        
    },

    async getAllInstructors(req: ExtendedRequest, res: Response){
        const instructors = await InstructorRepository.getAllInstructors()
        res.json({ success: true, data: instructors})
    }
}