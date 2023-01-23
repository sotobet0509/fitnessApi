import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { MeRepository } from '../repositories/me'
import { handleActivityPicture, handleProfilePicture } from '../services/files'
import { AdminRepository } from '../repositories/admin'
import { DataMissingError } from '../errors/DataMissingError'
import { ExerciseSchema } from '../interfaces/exercise'
import { DateSchema } from '../interfaces/date'
import { ProgressSchema } from '../interfaces/progress'
import { CatalogsRepository } from '../repositories/catalogues'

export const CataloguesController = {

    async getSeries(req: ExtendedRequest, res: Response) {
        const series  = await CatalogsRepository.getSeries()
        res.json ({success:true,data:series})
    },

    
    async getExercisesByCategory(req: ExtendedRequest, res: Response) {
        const categoria= req.params.categoria
        const series  = await CatalogsRepository.getExercisesByCategory(categoria)
        res.json ({success:true,data:series})
       
    },

    async getRepetitions(req: ExtendedRequest, res: Response) {
        const repeticiones  = await CatalogsRepository.getRepetitions()
        res.json ({success:true,data:repeticiones})
    },
    
    async getRest(req: ExtendedRequest, res: Response) {
        const descansos  = await CatalogsRepository.getRest()
        res.json ({success:true,data:descansos})
    },
    
    async getCategories(req: ExtendedRequest, res: Response) {
        const categorias  = await CatalogsRepository.getCategories()
        res.json ({success:true,data:categorias})
    },
    

}