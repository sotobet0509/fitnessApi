import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { MeRepository } from '../repositories/me'
import { handleActivityPicture, handleDietFile, handleProfilePicture } from '../services/files'
import { AdminRepository } from '../repositories/admin'
import { DataMissingError } from '../errors/DataMissingError'
import { ExerciseSchema } from '../interfaces/exercise'
import { DateSchema } from '../interfaces/date'
import { ProgressSchema } from '../interfaces/progress'
import { ImageSchema } from '../interfaces/image'
import { NotesSchema } from '../interfaces/notes'

export const AdminController = {

    async uploadProfilePicture(req: ExtendedRequest, res: Response) {
        const url = await handleProfilePicture(req.files.file)
        const user = req.user
    
        await AdminRepository.uploadProfilePicture(url, user)
    
        res.json({ success: true })
    },
    
    async profile(req: ExtendedRequest, res: Response) {
        const user = req.user
        const profile = await AdminRepository.getProfile(user.idUsuario)
        res.json({ success: true, data: profile })
    
    },

    async getPatients(req:ExtendedRequest,res:Response){
        const patients = await AdminRepository.getPatients()
        res.json ({success:true, data:patients})

    },

    async addComment(req:ExtendedRequest,res:Response){
        const idUsuario= req.params.idUsuario
        const exerciseId= req.params.idEjercicio
        const user = req.user
        const notesSchema = Joi.object().keys({
            notas: Joi.string().required()
        })

        const { error, value } = notesSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <NotesSchema>value
        const patient = await AdminRepository.addComment(idUsuario,data,exerciseId,user.idUsuario)
        res.json ({success:true})

    },


    async getPatientExercises(req:ExtendedRequest,res:Response){
        const idUsuario= req.params.idUsuario
        const fecha = req.params.fecha
        const exercises = await AdminRepository.getExercises(idUsuario,fecha)
        res.json ({succes:true,data:exercises})

    },

    async getPatientSteps(req:ExtendedRequest,res:Response){
        const idUsuario= req.params.idUsuario
        const fecha = req.params.fecha
        const steps = await AdminRepository.getSteps(idUsuario,fecha)
        res.json ({succes:true,data:steps})
    },

    async getPatientById(req:ExtendedRequest,res:Response){
        const idUsuario= req.params.idUsuario
        const user = await AdminRepository.getUserById(idUsuario)
        res.json({success:true, data:user})
    },

    async getPatientProgress(req:ExtendedRequest,res:Response){
        const idUsuario= req.params.idUsuario
        const progress = await AdminRepository.getPatientProgress(idUsuario)
        res.json({success:true, data:progress})
    },

    async getPatientPictures(req:ExtendedRequest,res:Response){
        const idUsuario= req.params.idUsuario
        const pictures = await AdminRepository.getPatientPictures(idUsuario)
        res.json({success:true, data:pictures})
    },

    async activateExercises(req:ExtendedRequest,res:Response){
        const idUsuario= req.params.idUsuario
        await AdminRepository.activateExercises(idUsuario) 
        res.json({ success: true })
    },

    async changePatientStatus(req:ExtendedRequest,res:Response){
        const idUsuario= req.params.idUsuario
        await AdminRepository.changePatientStatus(idUsuario) 
        res.json({ success: true })
    },

    async setExercise(req:ExtendedRequest,res:Response){
        const idUsuario = req.params.idUsuario
        const user = req.user
        const exerciseSchema = Joi.object().keys({
            nombre_ejercicio: Joi.number().required(),
            categoria_ejercicio: Joi.number().required(),
            series: Joi.number().required(),
            peso: Joi.string().required(),
            repeticiones: Joi.number().required(),
            descansos: Joi.number().required(),
            notas: Joi.string().required()
        })
        const { error, value } = exerciseSchema.validate(req.body)
        console.log(error)
        if (error) throw new DataMissingError()
        const data = <ExerciseSchema>value
        await AdminRepository.setExercise(idUsuario,data,user.idUsuario)
        res.json({success:true})
    },

    async getAllDates(req:ExtendedRequest,res:Response){
        console.log('antes de llamar ')
        const dates= await AdminRepository.getAllDates()
        console.log('despues de llamar')
        res.json({success:true,data:dates})
    },

    async getSingleDate(req:ExtendedRequest,res:Response){
        const dateId = req.params.id
        const date= await AdminRepository.getSingleDate(dateId)
        res.json({success:true,data:date})
    },

    async setDate(req:ExtendedRequest,res:Response){
        const idUsuario=req.params.idUsuario
        const dateSchema = Joi.object().keys({
            fecha_cita: Joi.string().required(),
            lugar: Joi.string().required()
        })

        const { error, value } = dateSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <DateSchema>value
        await AdminRepository.setDate(idUsuario,data)
        res.json({success:true})
    },

    async uploadImage(req:ExtendedRequest,res:Response){
        const idUsuario= req.params.idUsuario
        const url = await handleActivityPicture(req.files.file)
        const ImageSchema = Joi.object().keys({
            categoria:Joi.string().required()
        })

        const { error, value } = ImageSchema.validate(req.body)
        console.log(req.body)
        console.log (error)
        if (error) throw new DataMissingError()
        const data = <ImageSchema>value
        const images = await AdminRepository.uploadActivityPicture(url, idUsuario,data)
        res.json({ success: true, data: images })
    },

    async uploadDiet(req:ExtendedRequest,res:Response){
        const idUsuario= req.params.idUsuario
        const url = await handleDietFile(req.files.file)
        const images = await AdminRepository.uploadDietFile(url, idUsuario)
        res.json({ success: true, data: images })
    },

    async postPatientProgress(req:ExtendedRequest,res:Response){
        const idUsuario= req.params.idUsuario
        const progressSchema = Joi.object().keys({
            //pliegues
            pliegues_Tricipital:  Joi.number(),
            pliegues_Subescapular:  Joi.number(),
            pliegues_Bicipital:  Joi.number(),
            pliegues_Cresta_ilíaca :  Joi.number(),
            pliegues_Supraespinal:  Joi.number(),
            pliegues_Abdominal:  Joi.number(),
            pliegues_Muslo:  Joi.number(),
            pliegues_Pantorrilla:  Joi.number(),

            //perimetros
        
            perimetros_cintura: Joi.string(),
            perimetros_abdomen:  Joi.string(),
            perimetros_cadera:  Joi.string(),
            perimetros_brazo_contraido:  Joi.string(),
            perimetros_muslo:  Joi.string(),
            perimetros_pantorrilla:  Joi.string(),
            //resultados

            resultados_peso:  Joi.string(),
            resultados_grasa_corporal:  Joi.string(),
            resultados_kg_grasa:  Joi.string(),
            resultados_kg_musculo:  Joi.string(),
            resultados_suma_pliegues:  Joi.number()

        })

        const { error, value } = progressSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <ProgressSchema>value
        await AdminRepository.setProgress(idUsuario,data)
        res.json({success:true})
    }
}

