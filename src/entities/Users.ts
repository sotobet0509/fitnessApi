import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne } from 'typeorm'
import { Booking } from './Bookings'
import { ClassesHistory } from './ClassesHistory'
import { Purchase } from './Purchases'
import { Survey1 } from './Survey1'
import { User_categories } from './UserCategories'


@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid', { comment: "Identificador del tipo UUID del usuario" })
    id: string

    @Column({ comment: "Nombre del usuario" })
    name: string

    @Column({ comment: "Correo electrónico del usuario" })
    email: string

    @Column({ nullable: true, comment: "Apellido del usuario" })
    lastname: string

    @Column({ nullable: true, comment: "Contraseña del usuario hasheada" })
    password: string

    @Column('text', { nullable: true, comment: "Path de la foto de perfil del usuario" })
    pictureUrl: string

    @Column({ nullable: true, comment: "Identificador para usuarios registrados por facebook" })
    facebookId: string

    @Column({ nullable: true, comment: "Identificador para usuarios registrados por google" })
    googleId: string

    @Column({ nullable: true, comment: "Token temporal cambio de contraseñas" })
    tempToken: string

    @Column({ default: false, comment: "Bandera para indicar si el usuario es administrador" })
    isAdmin: boolean

    @Column({ default: false, comment: "Borrado logico del usuario" })
    isDeleted: boolean

    @CreateDateColumn({ comment: "Fecha en que se registro el usuario" })
    createdAt: Date

    @Column({ default: false, comment: "Bandera para indicar si es lider de un paquete grupal" })
    isLeader: boolean

    @Column({ nullable: true, comment: "Identificador del usuario lider del grupo al que pertence el usuario" })
    fromGroup: string

    @Column({ nullable: true, comment: "Nombre del grupo al que pertenece el usuario" })
    groupName: string

    @Column({ default: 0, comment: "Cambios disponibles para editar el grupo" })
    changed: number
    
    @OneToMany(type => Booking, Booking => Booking.User)
    Booking: Booking[]

    @OneToMany(type => Purchase, Purchase => Purchase.User)
    Purchase: Purchase[]

    @OneToMany(type => User_categories, User_categories => User_categories.User)
    User_categories: User_categories[]

    @OneToMany(type => Survey1, Survey1 => Survey1.User)
    Survey1: Survey1

    @OneToOne(type => ClassesHistory, ClassesHistory => ClassesHistory.User)
    ClassesHistory: ClassesHistory
}