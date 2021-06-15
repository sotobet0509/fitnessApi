import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm'
import { Schedule } from './Schedules'

@Entity({ name: 'instructors' })
export class Instructor {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico de instructor" })
    id: number

    @Column({ comment: "Nombre del instructor" })
    name: string

    @Column({ comment: "Apellido del instructor" })
    lastname: string

    @Column('text', { comment: "Inforamación que se quiere dar a conocer del instructor" })
    description: string

    @Column('text', { comment: "Path donde se localiza la foto de perfil del instructor" })
    profilePicture: string

    @Column('text', { comment: "Path donde se encuentra la imagen que se muestra al entrar a detalles de instructor" })
    largePicture: string

    @Column({ comment: "Borrado logico del instructor" })
    isDeleted: boolean

    @Column({ default: true, comment: "Bandera para indicar si el instructor se muestra" })
    isVisible: boolean

    @CreateDateColumn({ comment: "Fecha en que fue dado de alta el instructor" })
    createdAt: Date

    @Column({ nullable: true, comment: "Correo electrónico del instructor (sirve para hacer Login)" })
    email: string

    @Column({ nullable: true, comment: "Contraseña haseada para hacer login como instructor" })
    password: string

    @OneToMany(type => Schedule, Schedule => Schedule.Instructor)
    Schedule: Schedule

}