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

export const MeController ={

    async profile(req: ExtendedRequest, res: Response){
        const user = req.user
        const profile = await MeRepository.getProfile(user.id)
        res.json({ success: true, data: profile})
        
    },

    async history(req: ExtendedRequest, res: Response){
        const history = await MeRepository.getHistory(req.user)
        res.json({ success: true, data: history})
    },

    async classes(req: ExtendedRequest, res: Response){
        const classes = await MeRepository.getClasses(req.user)
        res.json({ success: true, data: classes})
    }
}