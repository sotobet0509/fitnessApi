import { getRepository, getConnection, Repository } from 'typeorm'
import * as moment from 'moment'
import { ErrorResponse } from '../errors/ErrorResponse'
import { Images } from '../entities/Images'


export const ImageRepository = {

    async getBackgroundImages() {
       const images = await getRepository(Images).find()

       return images
    }
}