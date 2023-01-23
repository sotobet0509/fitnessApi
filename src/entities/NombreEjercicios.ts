import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { NombreCategoriaEjercicios } from './NombreEjercicioCategoria'


@Entity({ name: 'nombreEjercicio' })
export class NombreEjercicio {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico del ejercicio" })
    id: number

    @Column({ comment: "nombre_ejercicio" })
    nombre_ejercicio: string

    @OneToMany(type => NombreCategoriaEjercicios, NombreCategoriaEjercicios => NombreCategoriaEjercicios.NombreEjercicio)
    nombre_categoria: NombreCategoriaEjercicios[]

}