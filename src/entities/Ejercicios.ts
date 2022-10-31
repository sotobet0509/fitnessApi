import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { CatalogoEjercicios } from './CatalogoEjercicios'
import { Usuario } from './Usuarios'

@Entity({ name: 'ejercicios' })
export class Ejercicios {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico de los ejercicios del paciente" })
    id: number

    @Column({comment:"Fecha ejercicio"})
    fecha_ejercicio: Date

    @Column({ default: false, comment: "Bandera para indicar si el ejercicio ya se completó" })
    completado: boolean
    
    @ManyToOne(type => Usuario, Usuario => Usuario.Ejercicio)
    @JoinColumn({name: 'id_usuario'})
    Usuario: Usuario

    @ManyToOne(type => CatalogoEjercicios, CatalogoEjercicios => CatalogoEjercicios.Ejercicio)
    @JoinColumn({name: 'id_ejercicio'})
    Ejercicio: CatalogoEjercicios


   

}