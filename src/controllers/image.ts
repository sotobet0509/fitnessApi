import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { ImageRepository } from '../repositories/image'
import { ErrorResponse } from '../errors/ErrorResponse'
import { handleHomePicture } from '../services/files'
import { ImageData } from '../interfaces/images'
import { DataMissingError } from '../errors/DataMissingError'

export const ImageController = {

    async getHomeImages(req: ExtendedRequest, res: Response) {
        const images = await ImageRepository.getHomeImages()
        res.json({ success: true, data: images })
    },
    async getAllImages(req: ExtendedRequest, res: Response) {
        const images = await ImageRepository.getAllImages()
        res.json({ success: true, data: images })
    },
    async uploadImage(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        const url = await handleHomePicture(req.files.file)
        const name = req.files.file.name
        const images = await ImageRepository.uploadHomeImagePicture(url, name)
        res.json({ success: true, data: images })
    },
    async changeImageStatus(req: ExtendedRequest, res: Response) {
        if (!req.user.isAdmin) throw new ErrorResponse(401, 15, "No autorizado")
        console.log(req.body)
        const purchaseSchema = Joi.object().keys({
            images: Joi.array().items(
                Joi.number()
            ).required()
        })
        const { error, value } = purchaseSchema.validate(req.body)
        if (error) {
            throw new DataMissingError()
        }

        const data = <ImageData>value
        await ImageRepository.changeImageStatus(data)

        res.json({ success: true })
    },



}