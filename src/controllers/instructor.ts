import { Request, Response } from 'express'
import axios from 'axios'
import Joi = require('@hapi/joi')
import config from '../config'
import { DataMissingError } from '../errors/DataMissingError'
import { ErrorResponse } from '../errors/ErrorResponse'
import { AuthRepository } from '../repositories/auth'
import { TokenService } from '../services/token'
import { ExtendedRequest } from '../../types'
import { MeRepository } from '../repositories/me'
import { BundleRepository } from '../repositories/bundle'
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