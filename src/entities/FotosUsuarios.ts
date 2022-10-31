import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { Usuario } from './Usuarios'

@Entity({ name: 'fotosUsuarios' })
export class FotosUsuarios {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico de la imagen" })
    id: number
    
    @Column('text', { comment: "Path de la imagen" })
    url: string

    @Column({comment:"Fecha de creación de la foto"})
    fecha_foto: Date

    @ManyToOne(type => Usuario, Usuario => Usuario.Foto)
    @JoinColumn({name: 'id_usuario'})
    Usuario: Usuario



}