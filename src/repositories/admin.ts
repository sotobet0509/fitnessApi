import { getRepository } from "typeorm"
import { CatalogoEjercicios } from "../entities/CatalogoEjercicios"
import { Citas } from "../entities/Citas"
import { DatosProgreso } from "../entities/DatosProgreso"
import { Ejercicios } from "../entities/Ejercicios"
import { FotosUsuarios } from "../entities/FotosUsuarios"
import { Usuario } from "../entities/Usuarios"
import { DateSchema } from "../interfaces/date"
import { ExerciseSchema } from "../interfaces/exercise"
import { ProgressSchema } from "../interfaces/progress"

export const AdminRepository = {
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
                activo: true,
                esAdministrador:true

            }

        })
       
        delete profile.contrasena

        return {
            profile
        }
    },

    async getAllDates (){
        const repository = getRepository(Citas)
        const dates = await repository.find({
            relations:['Usuario']
        })
        return dates
        
    },
    
    async getExercises (id:string){
        const repository = getRepository(Ejercicios)
        const exercises  = await repository.find({
            where:{
                id_usuario:id
            },
            relations: ["CatalogoEjercicios"]
        })
        return exercises
    },

    async uploadActivityPicture(url: string, id : string) {
        const repository = getRepository(Usuario)
        const user = await repository.findOne({
            where:{
                esAdministrador:false,
                activo:true,
                idUsuario:id
            }
            
        })
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
                id_usuario:id
            },
         
        })
        return pictures 
      },

      async getPatients(){
        const repository= getRepository(Usuario)
        const patients = await repository.find({
            where:{
                esAdministrador:false,
                activo:true
            }
        })
        return patients
      },

      async getUserById(id: string){
        const repository = getRepository(Usuario)
        const user = await repository.findOne({
            where:{
                esAdministrador:false,
                activo:true,
                idUsuario:id
            }
            
        })

        delete user.contrasena
        return user
      },

      async getPatientProgress(id : string){
        const repository = getRepository(DatosProgreso)
        const progress = await repository.findOne({
            where:{
                Usuario:id
            },
            order: { fecha_registro: 'DESC' }
        })
        return progress
      },

      async getPatientPictures(id : string){
        const repository = getRepository(FotosUsuarios)
        const pictures = await repository.find({
            where:{
                Usuario:id
            }
        })
        return pictures
      },

      async activateExercises(id : string){
        const repository  = getRepository(Usuario)
        let User  = await repository.findOne({
            where:{
                idUsuario:id
            }
        }) 

        User.seccion_ejercicios=!User.seccion_ejercicios
        repository.save(User)
      },

      async setExercise(id:string,data: ExerciseSchema){
        let idEjercicio  = data.id_ejercicio

        const repository = getRepository(CatalogoEjercicios)
        const ejercicio = await repository.findOne({
            where:{
                id:idEjercicio
            }
        })

        const UserRepository  =getRepository(Usuario)
        const user = await UserRepository.findOne({
            where:{
                idUsuario:id
            }
        })

        const exercisesRepo = getRepository(Ejercicios)
        const Exercise  = new Ejercicios()
        Exercise.fecha_ejercicio= new Date()
        Exercise.completado=false
        Exercise.Usuario=user
        Exercise.Ejercicio = ejercicio
        exercisesRepo.save(Exercise)


      },

      async getSingleDate(id : string){
        const repository  = getRepository(Citas)
        const date = await repository.findOne({
            where:{
                id:id
            }
        })
        return date
      },

      async setDate(id:string,data:DateSchema){
       
        let fecha_cita= data.fecha_cita
        let lugar = data.lugar
        const UserRepository  =getRepository(Usuario)
        const user = await UserRepository.findOne({
            where:{
                idUsuario:id
            }
        })
        const dateRepository  =getRepository(Citas)
        const Date  = new Citas()
        Date.fecha_cita= fecha_cita
        Date.lugar=lugar
        Date.Usuario=user
        dateRepository.save(Date)

      },

      async setProgress(id:string,data:ProgressSchema){
        const UserRepository  =getRepository(Usuario)
        const user = await UserRepository.findOne({
            where:{
                idUsuario:id
            }
        })

        const progressRepository = getRepository(DatosProgreso)
        const progress = new DatosProgreso()
        progress.Usuario=user
        progress.abdomen=data.abdomen
        progress.cadera=data.cadera
        progress.cintura=data.cintura
        progress.fecha_registro=new Date()
        progress.grasa_corporal=data.grasa_corporal
        progress.imc=data.imc
        progress.peso=data.peso
        progress.pasos=0

        progressRepository.save(progress)
      }
}