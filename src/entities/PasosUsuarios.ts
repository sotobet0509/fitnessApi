import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { Usuario } from './Usuarios'

@Entity({ name: 'pasos' })
export class Pasos {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico del registro de pasos" })
    id: number

    @Column({comment:"Fecha del registro de pasos "})
    fecha_registro: Date

    @Column({ comment: "cantidad de pasos" })
    cantidad:number

    @ManyToOne(type => Usuario, Usario => Usario.Cita)
    @JoinColumn({name: 'id_usuario'})
    Usuario: Usuario
}