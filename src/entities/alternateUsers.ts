import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Folios } from './Folios'


@Entity({name: 'alternate_Users'})
export class Alternate_users {
    @PrimaryGeneratedColumn('uuid' ,{comment: "Identificador del tipo UUID del usuario colaborador"})
    id: string
    
    @Column({comment: "Correo electrónico del usuario colaborador"})
    email: string

    @Column({comment: "	Contraseña haseada del usuario colaborador"})
    password: string

    @Column({comment: "Nombre del usuario colaborador"})
    name: string

    @Column({nullable: true, comment: "Datos de contacto del usuario colaborador"})
    contact: string

    @OneToMany(type => Folios, Folios => Folios.Alternate_users)
    Folios: Folios
}