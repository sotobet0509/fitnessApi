import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { CategoriaEjercicios } from './CategoriasEjercicios'
import { NombreEjercicio } from './NombreEjercicios'
import { Usuario } from './Usuarios'

@Entity({ name: 'ejerciciosCategoria' })
export class NombreCategoriaEjercicios {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico de los ejercicios por categoria" })
    id: number

    @ManyToOne(type => NombreEjercicio, NombreEjercicio => NombreEjercicio.id)
    @JoinColumn({name: 'id_nombre_ejercicio'})
    NombreEjercicio: NombreEjercicio

    @ManyToOne(type => CategoriaEjercicios, CategoriaEjercicios => CategoriaEjercicios.id)
    @JoinColumn({name: 'id_categoria_ejercicio'})
    CategoriaEjercicio: CategoriaEjercicios


}