import { getRepository} from 'typeorm'
import * as moment from 'moment'
import { Version } from '../entities/Versions'
import { ErrorResponse } from '../errors/ErrorResponse'
import { BlackList } from '../entities/BlackList'

export const VersionRepository = {

    async getLastVersion(frontVersion: number, token: string) {
        let orderedVersion: Version[]
        const versions = await getRepository(Version).find()

        if(versions.length == 0)throw new ErrorResponse(409, 45, 'No hay versiones registradas')

        orderedVersion = versions.sort((a: Version, b: Version) => {
            let date = moment(a.createdAt)
            let date2 = moment(b.createdAt)
            if (date.isBefore(date2)) return -1
            if (date.isAfter(date2)) return 1
            return 0
        })

        if(orderedVersion[orderedVersion.length -1].version != frontVersion && token){
            let blackListToken = new BlackList
            blackListToken.createdAt = new Date()
            blackListToken.token = token

            await getRepository(BlackList).save(blackListToken)

        }

        return orderedVersion[orderedVersion.length - 1]
        
    }
}