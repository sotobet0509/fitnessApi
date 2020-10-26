import { getRepository, getConnection, Repository } from 'typeorm'

import * as moment from 'moment'
import { Version } from '../entities/Versions'
import { ErrorResponse } from '../errors/ErrorResponse'

export const VersionRepository = {

    async getLastVersion() {
        let orderedVersion = []

        const versions = await getRepository(Version).find()

        if(versions.length == 0)throw new ErrorResponse(409, 45, 'No hay versiones registradas')
        if(!versions)throw new ErrorResponse(409, 45, 'No hay versiones registradas')

        orderedVersion = versions.sort((a: Version, b: Version) => {
            let date = moment(a.createdAt)
            let date2 = moment(b.createdAt)
            if (date.isBefore(date2)) return -1
            if (date.isAfter(date2)) return 1
            return 0
        })



        return orderedVersion[orderedVersion.length - 1]

    }
}