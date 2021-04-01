import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { ImageRepository } from '../repositories/image'

export const ImageController ={

    async getBackgroundImages(req: ExtendedRequest, res: Response){
        const images = await ImageRepository.getBackgroundImages()
        res.json({ success: true, data: images})
    },

    
}