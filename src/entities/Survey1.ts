import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinColumn, ManyToOne, CreateDateColumn } from 'typeorm'
import { User } from './Users'

export enum device {
    MOBILE = 'Mobile',
    DESKTOP = 'Desktop'
}

export enum conection {
    MOBILE = 'Mobile',
    WIFI = 'WiFi'
}

@Entity({ name: 'survey1' })
export class Survey1 {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico del cuestionario" })
    id: number

    @Column('enum', { enum: device, comment: "Dispositivo desde el que se realizó la compra" })
    device: device

    @Column({comment: "Navegador desde el que se realizó la compra"})
    browser: string

    @Column('enum', { enum: conection, comment: "Tipo de Acceso a internet con el que se realizó la compra" })
    conection: conection

    @Column('text', {comment: "Detelles de lo sucedido durante la compra"})
    description: string

    @Column({ nullable: true, comment: "Path donde se encuentra la imagen de evidencia de lo sucedido durante la compra" })
    url: string

    @CreateDateColumn({comment: "Fecha en la que se registro la encuesta"})
    createdAt: Date

    @ManyToOne(type => User, User => User.Survey1)
    @JoinColumn()
    User: User

}