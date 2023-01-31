import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { Usuario } from './Usuarios'

@Entity({ name: 'dietas' })
export class Dietas {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico de la dieta" })
    id: number

    @Column({comment:"Fecha de la dieta"})
    fecha_dieta: Date

    @Column({ comment: "Url dieta" })
    url: string

    @ManyToOne(type => Usuario, Usario => Usario.Dietas)
    @JoinColumn({name: 'id_usuario'})
    Usuario: Usuario
}