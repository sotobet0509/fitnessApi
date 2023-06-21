import { CategoriaEjercicios } from "../entities/CategoriasEjercicios"
import { Descansos } from "../entities/Descansos"
import { NombreEjercicio } from "../entities/NombreEjercicios"
import { Repeticiones } from "../entities/Repeticiones"
import { Series } from "../entities/Series"

export interface ExerciseSchema {
    nombre_ejercicio: NombreEjercicio
    categoria_ejercicio: CategoriaEjercicios
    series:Series
    peso: string
    repeticiones:Repeticiones
    descansos:Descansos
    notas:string
    fecha_ejercicio:Date
}