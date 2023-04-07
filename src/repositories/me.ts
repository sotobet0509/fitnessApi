import { getRepository } from "typeorm"
import { Citas } from "../entities/Citas"
import { Dietas } from "../entities/Dietas"
import { Ejercicios } from "../entities/Ejercicios"
import { FotosUsuarios } from "../entities/FotosUsuarios"
import { Pasos } from "../entities/PasosUsuarios"
import { Usuario } from "../entities/Usuarios"
import { StepsSchema } from "../interfaces/steps"
import { ImageSchema } from "../interfaces/image"

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

    async setSteps (user: Usuario,data: StepsSchema){
        const stepsRepo = getRepository(Pasos)
        const pasos  = new Pasos()
         var dateAndTime = new Date()
        var fecha = new Date(dateAndTime.toDateString());
        pasos.Usuario= user
        pasos.cantidad = data.cantidad
        pasos.fecha_registro=fecha
        stepsRepo.save(pasos)
    },

    async getSteps (id: Usuario,fecha : string){
        const repository = getRepository(Pasos)
        const pasos = await repository.find({
            where:{
                Usuario:id,
                fecha_registro:fecha
            }
        })
        return pasos
    },

    async getDiet (id: string){
        const repository = getRepository(Dietas)
        const dieta = await repository.find({
            where:{
                Usuario:id
            }
        })
        return dieta
    },
    
    async getExercises (id:string){
        const repository = getRepository(Ejercicios)
        const exercises  = await repository.find({
            where:{
                Usuario:id
            },
            relations: ["Descansos","Repeticiones","Series","Nombre_ejercicio","Categoria_ejercicio"]
        })
        return exercises
    },

    async uploadActivityPicture(url: string, user : Usuario, data :ImageSchema) {
        const imageRepository = getRepository(FotosUsuarios);
        const cat = data.categoria
        const image = new FotosUsuarios()
        image.url = url
        image.Usuario = user
        image.fecha_foto=new Date()
        image.categoria =cat
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