import { Request, Response } from 'express'
import { ExtendedRequest } from '../../types'
import { VersionRepository } from '../repositories/version'

export const VersionController ={

    async getLastVersion(req: ExtendedRequest, res: Response){
        const frontVersion = parseInt(req.params.version)
        const token = req.header('Authorization')

        const version = await VersionRepository.getLastVersion(frontVersion, token)
        res.json({ success: true, version})
    },

    
}