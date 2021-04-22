import { getRepository } from 'typeorm'
import { Images } from '../entities/Images'


export const ImageRepository = {

    async getBackgroundImages() {
       const images = await getRepository(Images).find()

       return images
    }
}