import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { QuestionRepository } from '../repositories/question'
import { DataMissingError } from '../errors/DataMissingError'
import { QuestionarySchema } from '../interfaces/questionary'
import { handleQuestions } from '../services/files'

export const QuestionController ={

    async saveQuestionary(req: ExtendedRequest, res: Response){
        const user = req.user

        const questionary = Joi.object().keys({
            device: Joi.string().valid('Mobile', 'Desktop').required(),
            browser: Joi.string().required(),
            conection: Joi.string().valid('Mobile', 'WiFi').required(),
            description: Joi.string().required()
        })

        const { error, value } = questionary.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <QuestionarySchema>value

        if(req.files){
            const url = await handleQuestions(req.files.file)
            data.url= url
        }

        await QuestionRepository.saveQuestionary(data, user)
        res.json({ success: true})
    },

    
}