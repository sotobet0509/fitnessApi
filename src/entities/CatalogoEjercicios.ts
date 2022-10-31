import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { Ejercicios } from './Ejercicios'

@Entity({ name: 'catalogoEjercicios' })
export class CatalogoEjercicios {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico del ejercicio" })
    id: number

    @Column({ comment: "Cadera" })
    nombre_ejercicio: string

    @Column({ comment: "Cadera" })
    serie: string

    @Column({ comment: "Cadera" })
    repeticiones: string

    @Column({ comment: "Cadera" })
    peso: string

    @Column({ comment: "Cadera" })
    descanso: string

    @Column({ comment: "Cadera" })
    notas: string

    @Column('text', { comment: "Cadera" })
    urlReferencia: string

    @OneToMany(type => Ejercicios, Ejercicios => Ejercicios.Ejercicio)
    Ejercicio: Ejercicios[]

}