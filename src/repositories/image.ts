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
    image.url = url
    image.section = "Home"
    await imageRepository.save(image)
  },


  async changeImageStatus(data: ImageData) {
    const imageRepository = getRepository(Images);
    for (var i in data.images) {
      const id = data.images[i]
      const image = await getRepository(Images).findOne({
        where: {
          id: id
        }
      })
      if (!image) throw new ErrorResponse(404, 14, 'La imagen ' + data.images[i] + ' no existe')
      image.status = !image.status
      await imageRepository.save(image)
    }
  },
};
