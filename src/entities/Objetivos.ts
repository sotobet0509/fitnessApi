import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { Usuario } from './Usuarios'

@Entity({ name: 'objetivos' })
export class Objetivos {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico del registro de objetivos" })
    id: number

    @Column({comment:"Fecha del registro del objetivo "})
    fecha_registro: Date

    @Column({ comment: "descripcion" })
    Descripcion:string

    @Column({ default: false, comment: "Bandera para indicar si el objetivo ya se cumplio" })
    completado: boolean

    @ManyToOne(type => Usuario, Usario => Usario.Cita)
    @JoinColumn({name: 'id_usuario'})
    Usuario: Usuario
}