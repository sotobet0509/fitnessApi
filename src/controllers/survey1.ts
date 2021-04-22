import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { Survey1Repository } from '../repositories/survey1'
import { DataMissingError } from '../errors/DataMissingError'
import { Survey1Schema } from '../interfaces/survey1'
import { handleSurvey1 } from '../services/files'

export const Survey1Controller ={

    async saveSurvey1(req: ExtendedRequest, res: Response){
        const user = req.user

        const questionary = Joi.object().keys({
            device: Joi.string().valid('Mobile', 'Desktop').required(),
            browser: Joi.string().required(),
            conection: Joi.string().valid('Mobile', 'WiFi').required(),
            description: Joi.string().required()
        })

        const { error, value } = questionary.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <Survey1Schema>value

        if(req.files){
            const url = await handleSurvey1(req.files.file)
            data.url= url
        }

        await Survey1Repository.saveSurvey1(data, user)
        res.json({ success: true})
    },

    
}