import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { MeRepository } from '../repositories/me'
import { handleProfilePicture } from '../services/files'

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
    },

    async uploadProfilePicture(req: ExtendedRequest, res: Response){
        //console.log(req.files)
        const url = await handleProfilePicture(req.files.file)
        //console.log(url)
        const user = req.user

        await MeRepository.uploadProfilePicture(url, user)

        res.json({ success: true})
   }
}