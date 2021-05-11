import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { InstructorRepository } from '../repositories/instructor'
import { ErrorResponse } from '../errors/ErrorResponse'
import { InstructorSchema } from '../interfaces/instructor'
import { DataMissingError } from '../errors/DataMissingError'
import { handleInstructorProfilePicture } from '../services/files'

export const InstructorController = {

    async getInstructor(req: ExtendedRequest, res: Response) {
        const instructorId = parseInt(req.params.instructor_id)
        const instructor = await InstructorRepository.getInstructor(instructorId)
        res.json({ success: true, data: instructor })

    },

    async getAllInstructors(req: ExtendedRequest, res: Response) {
        const instructors = await InstructorRepository.getAllInstructors()
        res.json({ success: true, data: instructors })
    },

    async createInstructor(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const instructorSchema = Joi.object().keys({
            name: Joi.string().required(),
            lastname: Joi.string().required(),
            description: Joi.string().required()
        })
        const { error, value } = instructorSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <InstructorSchema>value
        const url = await handleInstructorProfilePicture(req.files.file)
        const url2 = await handleInstructorProfilePicture(req.files.file2)
        data.profilePicture = url
        data.largePicture = url2

        await InstructorRepository.createInstructor(data)
        res.json({ success: true })
    },

    async updateInstructor(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const instructorSchema = Joi.object().keys({
            id: Joi.number().required(),
            name: Joi.string(),
            lastname: Joi.string(),
            description: Joi.string(),
            profilePicture: Joi.string(),
            largePicture: Joi.string(),
        })
        const { error, value } = instructorSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <InstructorSchema>value

        let url = ""
        let url2 = ""
        if (req.files && req.files.file) {
            url = await handleInstructorProfilePicture(req.files.file)
            data.profilePicture = url
        }

        if (req.files && req.files.file2) {
            url2 = await handleInstructorProfilePicture(req.files.file2)
            data.largePicture = url2
        }


        await InstructorRepository.updateInstructor(data)
        res.json({ success: true })
    },

    async deleteInstructor(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")

        const instructorId = parseInt(req.params.instructor_id)


        await InstructorRepository.changeisDeletedInstructor(instructorId)
        res.json({ success: true })
    },

    async changeInstructorProfilePicture(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")

        const url = await handleInstructorProfilePicture(req.files.file)
        const instructorId = parseInt(req.params.instructor_id)

        await InstructorRepository.changeInstructorProfilePicture(url, instructorId)

        res.json({ success: true })
    },
    
    async getVisibleInstructors(req: ExtendedRequest, res: Response) {
        const instructors = await InstructorRepository.getVisibleInstructors()
        res.json({ success: true, data: instructors })
    },

    
    async reassignInstructor(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")

        let id = parseInt(req.params.instructorId)
        const instructorSchema = Joi.object().keys({
            id: Joi.number().required()
        })
        const { error, value } = instructorSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <InstructorSchema>value
        const instructors = await InstructorRepository.reassignInstructor(data,id)
        res.json({ success: true, data: instructors })
    },


}