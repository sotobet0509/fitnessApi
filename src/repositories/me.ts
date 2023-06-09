import { MoreThanOrEqual, getRepository } from "typeorm"
import { Citas } from "../entities/Citas"
import { Dietas } from "../entities/Dietas"
import { Ejercicios } from "../entities/Ejercicios"
import { FotosUsuarios } from "../entities/FotosUsuarios"
import { Pasos } from "../entities/PasosUsuarios"
import { Usuario } from "../entities/Usuarios"
import { StepsSchema } from "../interfaces/steps"
import { ImageSchema } from "../interfaces/image"
import { NotesSchema } from "../interfaces/notes"

export const MeRepository = {

    async getPendingExercises(user: string){
        const temporalDate = new Date()
        temporalDate.setHours(0, 0, 0, 0)
        const repository = getRepository(Ejercicios)
        const ejercicios = await repository.find({
            where:{
                Usuario:user,
                fecha_ejercicio:MoreThanOrEqual(temporalDate),
                completado :false
            }
        })
        
        const days =[]
        for (var i in ejercicios){
            const ejercicio = ejercicios[i]

            ejercicio.fecha_ejercicio.setHours(ejercicio.fecha_ejercicio.getHours()-6)
            days.push(ejercicio.fecha_ejercicio)
        }
        const count= ejercicios.length
        
        return {days,count}
    },
    async getPendingDates(user: string){
        const temporalDate = new Date()
        temporalDate.setHours(0, 0, 0, 0)
        const repository = getRepository(Citas)
        const dates = await repository.find({
            where:{
                Usuario:user,
                fecha_cita:MoreThanOrEqual(temporalDate)
            }
        })
        
        const days =[]
        for (var i in dates){
            const date = dates[i]
            date.fecha_cita.setHours(date.fecha_cita.getHours()-6)

            days.push(date.fecha_cita)
        }
        const count= dates.length
        
        return {days,count}
    },
    async addComment(id : string,data :NotesSchema,idEjercicio:string){
        const repository  = getRepository(Ejercicios)
        let ejercicio  = await repository.findOne({
            where:{
                id:idEjercicio,
                Usuario:id
            }
        }) 
        const userRepository = getRepository(Usuario)
        const admin = await userRepository.findOne({
            where: {
                idUsuario: id,
                activo: true
            }
        }) 
        ejercicio.Notas.push({
            Nombre: admin.nombre,
            nota: data.notas,
          })
        repository.save(ejercicio)
      },


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