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
import { LocationRepository } from '../repositories/location'
import { ScheduleRepository } from '../repositories/schedule'


export const ScheduleController ={

    async getSchedule(req: ExtendedRequest, res: Response){
        const scheduleId = parseInt(req.params.scheduleId)
        const schedule = await ScheduleRepository.getSchedule(scheduleId)
        res.json({ success: true, data: schedule})
        
    }

}