import { MoreThan, MoreThanOrEqual, getRepository } from "typeorm"
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
import { Pasos } from "../entities/PasosUsuarios"
import { ImageSchema } from "../interfaces/image"
import { NotesSchema } from "../interfaces/notes"

export const AdminRepository = {

    async getPendingDates(){
        const temporalDate = new Date()
        temporalDate.setHours(0, 0, 0, 0)
        const repository = getRepository(Citas)
        const dates = await repository.find({
            where:{
                fecha_cita: MoreThanOrEqual(temporalDate)
            },
            relations:['Usuario']
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
    async uploadProfilePicture(url: string, user: Usuario) {
        const userRepository = getRepository(Usuario)
        user.urlFoto = url
        await userRepository.save(user)
    },
    async deleteExercise(id : string,idEjercicio:string){
        const repository  = getRepository(Ejercicios)
        let ejercicio  = await repository.findOne({
            where:{
                id:idEjercicio,
                Usuario:id
            }
        })
        repository.delete(ejercicio.id)
    }
    ,

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
    
    async getExercises (id:string,fecha : string){
        const repository = getRepository(Ejercicios)
       
        const exercises  = await repository.find({
            where:{
                Usuario:id,
                fecha_ejercicio:fecha
            },
            relations: ["Categoria_ejercicio","Nombre_ejercicio","Series","Repeticiones","Descansos"]
        })
       
        
       
      
      return exercises

    },

    async getSteps (id:string,fecha : string){
        const repository = getRepository(Pasos)
        const pasos  = await repository.find({
            where:{
                Usuario:id,
                fecha_registro:fecha
            }
    
        })
        return pasos
    },
    async uploadActivityPicture(url: string, id : string, data :ImageSchema) {
        const repository = getRepository(Usuario)
        const cat = data.categoria
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
        image.categoria=cat
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
                Usuario:id
            }
        })
        if (dietaAnterior){
            await dietaRepository.delete(dietaAnterior)
        }
       
            const dieta = new Dietas()
            dieta.url = url
            dieta.Usuario = user
            dieta.fecha_dieta=new Date()
            await dietaRepository.save(dieta)

           
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
                esAdministrador:false
            }
        })
        return patients
      },

      async getUserById(id: string){
        const repository = getRepository(Usuario)
        const user = await repository.findOne({
            where:{
                esAdministrador:false,
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

      async addComment(id : string,data :NotesSchema,idEjercicio:string,adminId:string){
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
                idUsuario: adminId,
                activo: true
            },
        })

        ejercicio.Notas.push({
            Nombre: admin.nombre,
            nota: data.notas,
          })
        repository.save(ejercicio)
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

      async setExercise(id:string,data: ExerciseSchema,adminId :string){
       
       let peso= data.peso

        //hacer validaciones de datos que provienen de catalogos
        const CategoryRepository  =getRepository(CategoriaEjercicios)
        const categoria = await CategoryRepository.findOne({
            where:{
                id:data.categoria_ejercicio
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
                id: data.series
            }
        })
        const UserRepository  =getRepository(Usuario)
        const user = await UserRepository.findOne({
            where:{
                idUsuario:id
            }
        })

        const admin =await UserRepository.findOne({
            where:{
                idUsuario:adminId
            }
        })

        const exercisesRepo = getRepository(Ejercicios)
        const Exercise  = new Ejercicios()
        var dateAndTime = new Date()
        var fecha = new Date(dateAndTime.toDateString());
        Exercise.fecha_ejercicio= fecha
        Exercise.completado=false
        Exercise.Usuario=user
        Exercise.Categoria_ejercicio = categoria
        Exercise.Nombre_ejercicio=nombre
        Exercise.Series=series
        Exercise.Repeticiones=repeticiones
        Exercise.Peso=peso
        Exercise.Descansos=descansos
        Exercise.Notas = [{ Nombre: admin.nombre, nota: data.notas }]
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
        progress.pliegues_Tricipital=data.pliegues_Tricipital
        progress.pliegues_Subescapular=data.pliegues_Subescapular
        progress.pliegues_Bicipital=data.pliegues_Bicipital
        progress.pliegues_Cresta_ilíaca=data.pliegues_Cresta_ilíaca
        progress.pliegues_Supraespinal=data.pliegues_Supraespinal
        progress.pliegues_Abdominal=data.pliegues_Abdominal
        progress.pliegues_Muslo=data.pliegues_Muslo
        progress.pliegues_Pantorrilla=data.pliegues_Pantorrilla
        progress.perimetros_cintura=data.perimetros_cintura
        progress.perimetros_abdomen=data.perimetros_abdomen
        progress.perimetros_cadera=data.perimetros_cadera
        progress.perimetros_brazo_contraido=data.perimetros_brazo_contraido
        progress.perimetros_muslo=data.perimetros_muslo
        progress.perimetros_pantorrilla=data.perimetros_pantorrilla
        progress.resultados_peso=data.resultados_peso
        progress.resultados_kg_grasa=data.resultados_peso
        progress.resultados_grasa_corporal=data.resultados_grasa_corporal
        progress.resultados_kg_musculo=data.resultados_kg_musculo
        progress.resultados_suma_pliegues=data.resultados_suma_pliegues
        progress.fecha_registro=new Date()
     

        progressRepository.save(progress)
      }
}