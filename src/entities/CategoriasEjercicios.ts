import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { NombreCategoriaEjercicios } from './NombreEjercicioCategoria'


@Entity({ name: 'categoria' })
export class CategoriaEjercicios {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico del ejercicio" })
    id: number

    @Column({ comment: "nombre_categoria" })
    categoria: string

    @OneToMany(type => NombreCategoriaEjercicios, NombreCategoriaEjercicios => NombreCategoriaEjercicios.CategoriaEjercicio)
    NombreCategoriaEjercicios: NombreCategoriaEjercicios[]

}