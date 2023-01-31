import { getRepository } from "typeorm"
import { CategoriaEjercicios } from "../entities/CategoriasEjercicios"
import { Citas } from "../entities/Citas"
import { DatosProgreso } from "../entities/DatosProgreso"
import { Ejercicios } from "../entities/Ejercicios"
import { FotosUsuarios } from "../entities/FotosUsuarios"
import { NombreEjercicio } from "../entities/NombreEjercicios"
import { Series } from "../entities/Series"
import { Usuario } from "../entities/Usuarios"
import { Repeticiones } from "../entities/Repeticiones"
import { DataMissingError } from "../errors/DataMissingError"
import { DateSchema } from "../interfaces/date"
import { ExerciseSchema } from "../interfaces/exercise"
import { ProgressSchema } from "../interfaces/progress"
import { Descansos } from "../entities/Descansos"
import { Dietas } from "../entities/Dietas"

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


      async uploadDietFile(url: string, id : string) {
        const repository = getRepository(Usuario)
        const user = await repository.findOne({
            where:{
                esAdministrador:false,
                activo:true,
                idUsuario:id
            }
            
        })
        const dietaRepository = getRepository(Dietas)
        const dietaAnterior = await dietaRepository.findOne({
            where:{
                idUsuario:id
            }
        })
        if (dietaAnterior){
            await dietaRepository.delete(dietaAnterior)
        }
        else{
            const dieta = new Dietas()
            dieta.url = url
            dieta.Usuario = user
            dieta.fecha_dieta=new Date()
            await dietaRepository.save(dieta)

        }     
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

      async changePatientStatus(id:string){
        const repository  = getRepository(Usuario)
        let User  = await repository.findOne({
            where:{
                idUsuario:id
            }
        }) 

        User.activo=!User.activo
        repository.save(User)
      },

      async setExercise(id:string,data: ExerciseSchema){
        
       let peso= data.peso
    
       let notas=  data.notas
        //hacer validaciones de datos que provienen de catalogos
        const CategoryRepository  =getRepository(CategoriaEjercicios)
        const categoria = await CategoryRepository.findOne({
            where:{
                id:data.series
            }
        })
        const NombreEjercicioRepository  =getRepository(NombreEjercicio)
        const nombre = await NombreEjercicioRepository.findOne({
            where:{
                id:data.nombre_ejercicio
            }
        })
        const RepeticionesRepository  =getRepository(Repeticiones)
        const repeticiones = await RepeticionesRepository.findOne({
            where:{
                id:data.repeticiones
            }
        })

        const DescansosRepository  =getRepository(Descansos)
        const descansos = await DescansosRepository.findOne({
            where:{
                id:data.descansos
            }
        })
        const SeriesRepository  =getRepository(Series)
        const series = await SeriesRepository.findOne({
            where:{
                id: data.categoria_ejercicio
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
        Exercise.Categoria_ejercicio = categoria
        Exercise.Nombre_ejercicio=nombre
        Exercise.Series=series
        Exercise.Repeticiones=repeticiones
        Exercise.Peso=peso
        Exercise.Descansos=descansos
        Exercise.Notas=notas
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