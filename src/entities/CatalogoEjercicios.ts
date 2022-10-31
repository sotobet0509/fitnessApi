import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { Ejercicios } from './Ejercicios'

@Entity({ name: 'catalogoEjercicios' })
export class CatalogoEjercicios {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico del ejercicio" })
    id: number

    @Column({ comment: "nombre_ejercicio" })
    nombre_ejercicio: string

    @Column({ comment: "series" })
    serie: string

    @Column({ comment: "repeticiones" })
    repeticiones: string

    @Column({ comment: "peso" })
    peso: string

    @Column({ comment: "descanso" })
    descanso: string

    @Column({ comment: "notas" })
    notas: string

    @Column('text', { comment: "urlReferencia" })
    urlReferencia: string

    @OneToMany(type => Ejercicios, Ejercicios => Ejercicios.Ejercicio)
    Ejercicio: Ejercicios[]

}