import { getRepository } from "typeorm"
import { Citas } from "../entities/Citas"
import { Ejercicios } from "../entities/Ejercicios"
import { FotosUsuarios } from "../entities/FotosUsuarios"
import { Usuario } from "../entities/Usuarios"

export const MeRepository = {
    async uploadProfilePicture(url: string, user: Usuario) {
        const userRepository = getRepository(Usuario)
        user.urlFoto = url
        await userRepository.save(user)
    },

    async getProfile(id: string) {
        const repository = getRepository(Usuario)
        const profile = await repository.findOne({
            where: {
                idUsuario: id,
                activo: true
            },
            relations: ["Datos"]
        })
       
        delete profile.contrasena

        return {
            profile
        }
    },

    async getDates (id: string){
        const repository = getRepository(Citas)
        const dates = await repository.find({
            where:{
                Usuario:id
            }
        })
        return dates
    },
    
    async getExercises (id:string){
        const repository = getRepository(Ejercicios)
        const exercises  = await repository.find({
            where:{
                Usuario:id
            },
            relations: ["Ejercicio"]
        })
        return exercises
    },

    async uploadActivityPicture(url: string, user : Usuario) {
        const imageRepository = getRepository(FotosUsuarios);
        const image = new FotosUsuarios()
        image.url = url
        image.Usuario = user
        image.fecha_foto=new Date()
        await imageRepository.save(image)
      },

      async getActivityPictures(id :string){
        const repository = getRepository(FotosUsuarios)
        const pictures  = await repository.find({
            where:{
                Usuario:id
            },
         
        })
        return pictures 
      },

      async markExerciseAsCompleted(user: Usuario,idEjercicio:string ){
        const exercisesRepo = getRepository(Ejercicios)
        const exercise = await exercisesRepo.findOne({
            where:{
                id:idEjercicio,
                Usuario:user
            }
        })
        exercise.completado=true
        exercisesRepo.save(exercise)
        return exercise
      }
}