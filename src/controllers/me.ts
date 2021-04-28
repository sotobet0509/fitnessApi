import { Request, Response } from 'express'
import Joi = require('@hapi/joi')
import { ExtendedRequest } from '../../types'
import { MeRepository } from '../repositories/me'
import { handleProfilePicture } from '../services/files'
import { DataMissingError } from '../errors/DataMissingError'
import { ClientData } from '../interfaces/auth'
import { EditItems } from '../interfaces/items'
import { ErrorResponse } from '../errors/ErrorResponse'
import { GroupName, UserId } from '../interfaces/me'
import { MemberEmail } from '../interfaces/purchase'

export const MeController = {

    async profile(req: ExtendedRequest, res: Response) {
        const user = req.user
        const profile = await MeRepository.getProfile(user.id)
        res.json({ success: true, data: profile })

    },
   
    async history(req: ExtendedRequest, res: Response) {
        let page = req.query.page.toString()
        const history = await MeRepository.getHistory(page,req.user)
        res.json({ success: true, data: history })
    },

    async classes(req: ExtendedRequest, res: Response) {
        const classes = await MeRepository.getClasses(req.user)
        res.json({ success: true, data: classes })
    },

    async uploadProfilePicture(req: ExtendedRequest, res: Response) {
        const url = await handleProfilePicture(req.files.file)
        const user = req.user

        await MeRepository.uploadProfilePicture(url, user)

        res.json({ success: true })
    },

    async editUsers(req: ExtendedRequest, res: Response) {
        const userSchema = Joi.object().keys({
            name: Joi.string(),
            lastname: Joi.string(),
            email: Joi.string(),
            password: Joi.string()
        })
        const { error, value } = userSchema.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <ClientData>value


        const classes = await MeRepository.updateUserData(req.user, data)
        res.json({ success: true, data: classes })
    },

    async editItems(req: ExtendedRequest, res: Response) {
        const editItems = Joi.object().keys({
            categories: Joi.array().items(
                Joi.number()
            ).required()
        })

        const { error, value } = editItems.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <EditItems>value

        await MeRepository.editItems(data, req.user)
        res.json({ success: true })
    },

    async getItems(req: ExtendedRequest, res: Response) {
        const user = req.user
        const items = await MeRepository.getItems(user)
        res.json({ success: true, data: items })

    },

    async getItemCategories(req: ExtendedRequest, res: Response) {
        const itemId = parseInt(req.params.item_id)
        const categories = await MeRepository.getItemCategories(itemId)
        res.json({ success: true, data: categories })

    },

    async getAllItems(req: ExtendedRequest, res: Response) {
        const items = await MeRepository.getAllItems()
        res.json({ success: true, data: items })

    },

    async getMembers(req: ExtendedRequest, res: Response) {
        //if (!req.user.isLeader) throw new ErrorResponse(401, 16, "El usuario no es Lider de un grupo")
        const members = await MeRepository.getMembers(req.user)
        res.json({ success: true, data: members })

    },

    async removeMember(req: ExtendedRequest, res: Response) {
        if (!req.user.isLeader) throw new ErrorResponse(401, 16, "El usuario no es Lider de un grupo")
        const member = Joi.object().keys({
            user_id: Joi.string().required()
        })

        const { error, value } = member.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <UserId>value
        await MeRepository.removeMember(req.user, data)
        res.json({ success: true })

    },

    async inviteMember(req: ExtendedRequest, res: Response) {
        const userId = req.user.id

        const memberEmail = Joi.object().keys({
            email: Joi.string().required()
        })
        const { error, value } = memberEmail.validate(req.body)
        if (error) throw new DataMissingError()
        const email = <MemberEmail>value

        const token = await MeRepository.inviteMember(userId, email)
        res.json({ success: true, data: token })

    },

    async changeGroupName(req: ExtendedRequest, res: Response) {
        if (!req.user.isLeader) throw new ErrorResponse(401, 16, "El usuario no es Lider de un grupo")

        const groupName = Joi.object().keys({
            groupName: Joi.string().required()
        })
        const { error, value } = groupName.validate(req.body)
        if (error) throw new DataMissingError()
        const data = <GroupName>value

        await MeRepository.changeGroupName(req.user, data)
        res.json({ success: true })

    },

    async updateClassesHistory(req: ExtendedRequest, res: Response) {
        await MeRepository.updateClassesHistory()
        res.json({ success: true })

    },

    async updatePendings(req: ExtendedRequest, res: Response) {
        await MeRepository.updatePendings()
        res.json({ success: true })

    },
}