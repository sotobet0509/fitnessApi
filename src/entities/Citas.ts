import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { Usuario } from './Usuarios'

@Entity({ name: 'citas' })
export class Citas {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico de la cita" })
    id: number

    @Column({comment:"Fecha de la cita"})
    fecha_cita: Date

    @Column({ comment: "Lugar de la cita" })
    lugar: string

    @ManyToOne(type => Usuario, Usario => Usario.Cita)
    @JoinColumn({name: 'id_usuario'})
    Usuario: Usuario
}