import { getRepository } from "typeorm";
import { Images } from "../entities/Images";
import { ErrorResponse } from "../errors/ErrorResponse";
import { ImageData } from "../interfaces/images";

export const ImageRepository = {
  async getHomeImages() {
    const images = await getRepository(Images).find({
      where: { status: true },
    });

    return images;
  },

  async uploadHomeImagePicture(url: string) {
   const imageRepository = getRepository(Images);
   const image = new Images()
   image.url=url
   await imageRepository.save(image)
},


  async changeImageStatus(data: ImageData) {
    const imageRepository = getRepository(Images);
    let images = []
    for (var i in data.images){
      const id = data.images[i]
      const image = await getRepository(Images).findOne({
        where: {
            id: id
        }
    })
    if (!image) throw new ErrorResponse(404, 14, 'La imagen no existe '+data.images[i])
    image[i].status = !image[i].status
    await imageRepository.save(image)
    }
   
    
    return images;
  },
};
