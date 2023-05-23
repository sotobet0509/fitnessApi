import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { MeRepository } from '../repositories/me'
import { handleActivityPicture, handleProfilePicture } from '../services/files'
import { DataMissingError } from '../errors/DataMissingError'
import { StepsSchema } from '../interfaces/steps'
import { ImageSchema } from '../interfaces/image'
import { NotesSchema } from '../interfaces/notes'
export const MeController = {


    async addComment(req:ExtendedRequest,res:Response){
        const user = req.user
        const exerciseId= req.params.idEjercicio
        const notesSchema = Joi.object().keys({
            notas: Joi.string().required()
        })

        const { error, value } = notesSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <NotesSchema>value
        const patient = await MeRepository.addComment(user.idUsuario,data,exerciseId)
        res.json ({success:true})

    },
async uploadProfilePicture(req: ExtendedRequest, res: Response) {
    const url = await handleProfilePicture(req.files.file)
    const user = req.user

    await MeRepository.uploadProfilePicture(url, user)

    res.json({ success: true })
},

async profile(req: ExtendedRequest, res: Response) {
    const user = req.user
    const profile = await MeRepository.getProfile(user.idUsuario)
    res.json({ success: true, data: profile })

},

async getDiet(req: ExtendedRequest, res: Response) {
    const user = req.user
    const profile = await MeRepository.getDiet(user.idUsuario)
    res.json({ success: true, data: profile })

},

async getDates (req:ExtendedRequest,res:Response){
    const user = req.user
    const dates  = await MeRepository.getDates(user.idUsuario)
    res.json ({success:true,data:dates})
},

async getSteps (req:ExtendedRequest,res:Response){
    const user = req.user
    const dates  = await MeRepository.getSteps(user,req.params.fecha)
    res.json ({success:true,data:dates})
},

async postSteps(req:ExtendedRequest,res:Response){
    const user = req.user
    const stepsSchema = Joi.object().keys({
        cantidad: Joi.string().required()
    })
    const { error, value } = stepsSchema.validate(req.body)
    console.log(error)
    if (error) throw new DataMissingError()
    const data = <StepsSchema>value
    await MeRepository.setSteps(user,data)
    res.json({success:true})
},

async getExercises (req:ExtendedRequest,res:Response){
    const user = req.user
    const exercises  = await MeRepository.getExercises(user.idUsuario)
    res.json ({success:true,data:exercises})
},

async uploadImage(req: ExtendedRequest, res: Response) {
    const user = req.user
    const url = await handleActivityPicture(req.files.file)
    const ImageSchema = Joi.object().keys({
        categoria:Joi.string().required()
    })
    const { error, value } = ImageSchema.validate(req.body)  
    if (error) throw new DataMissingError()
    const data = <ImageSchema>value
    const images = await MeRepository.uploadActivityPicture(url, user,data)
    res.json({ success: true, data: images })
},

async getActivityPictures(req: ExtendedRequest, res: Response){
    const user = req.user
    const pictures  = await MeRepository.getActivityPictures(user.idUsuario)
    res.json ({success:true,data:pictures})
},

async markExerciseAsCompleted(req:ExtendedRequest,res:Response){
    const user = req.user
    const exerciseId= req.params.idEjercicio
    console.log(exerciseId)
    const exercise =await MeRepository.markExerciseAsCompleted(user,exerciseId)
    res.json({success:true,data:exercise})
}
}