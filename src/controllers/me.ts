import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { MeRepository } from '../repositories/me'
import { handleActivityPicture, handleProfilePicture } from '../services/files'

export const MeController = {

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

async getDates (req:ExtendedRequest,res:Response){
    const user = req.user
    const dates  = await MeRepository.getDates(user.idUsuario)
    res.json ({success:true,data:dates})
},

async getExercises (req:ExtendedRequest,res:Response){
    const user = req.user
    const exercises  = await MeRepository.getExercises(user.idUsuario)
    res.json ({success:true,data:exercises})
},

async uploadImage(req: ExtendedRequest, res: Response) {
    const url = await handleActivityPicture(req.files.file)
    const user = req.user
    const images = await MeRepository.uploadActivityPicture(url, user)
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