import { getRepository, getConnection } from 'typeorm'
import { CategoriaEjercicios } from '../entities/CategoriasEjercicios'
import { Descansos } from '../entities/Descansos'
import { NombreCategoriaEjercicios } from '../entities/NombreEjercicioCategoria'
import { Repeticiones } from '../entities/Repeticiones'
import { Series } from '../entities/Series'


export const CatalogsRepository = {

    async getSeries (){
        const repository = getRepository(Series)
        const series = await repository.find({
        })
        return series
       
    },

    async getExercisesByCategory (id : string){
        let id_Categoria  = id
        const repository = getRepository(NombreCategoriaEjercicios)
        const ejerciciosPorCategoria = await repository.find({
            where:{
                CategoriaEjercicio:id_Categoria
            },
            relations: ['CategoriaEjercicio','NombreEjercicio']
        })
        return ejerciciosPorCategoria
       
    },

    async getRepetitions (){
        const repository = getRepository(Repeticiones)
        const repeticiones = await repository.find({
        })
        return repeticiones
       
    },

    async getRest (){
        const repository = getRepository(Descansos)
        const descansos = await repository.find({
        })
        return descansos
       
    },

    async getCategories (){
        const repository = getRepository(CategoriaEjercicios)
        const categorias = await repository.find({
        })
        return categorias
       
    },


}