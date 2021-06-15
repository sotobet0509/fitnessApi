import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Purchase } from './Purchases'

@Entity({ name: 'bundles' })
export class Bundle {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico del paquete" })
    id: number

    @Column({ comment: "Nombre del paquete" })
    name: string

    @Column('float', { comment: "Precio de lista del paquete" })
    price: number

    @Column('float', { nullable: true, comment: "Precio de oferta del paquete" })
    offer: number

    @Column({ comment: "Información del contenido del paquete" })
    description: string

    @Column('integer', { comment: "Número de clases que incluye el paquete" })
    classNumber: number

    @Column('integer', { comment: "Número de días de vigencia del paquete" })
    expirationDays: number

    @Column('integer', { comment: "Número de pases que incluye el paquete" })
    passes: number

    @Column({ comment: "Borrado logico del paquete" })
    isDeleted: boolean

    @Column({ comment: "Bandera para compras recurrentes" })
    isRecurrent: boolean

    @Column({ default: false, comment: "Bandera para indicar si el paquete tiene clases ilimitadas" })
    isUnlimited: boolean

    @Column({ default: false, comment: "Bandera para indicar si el paquete es especial" })
    isEspecial: boolean

    @Column({ nullable: true, comment: "Información del contenido extra del paquete especial" })
    especialDescription: string

    @Column('integer', { nullable: true, comment: "Duración en días de la promoción" })
    promotionExpirationDays: number

    @Column({ nullable: true, comment: "Path de la imagen del paquete especial" })
    pictureUrl: string

    @Column('integer', { nullable: true , comment:"Identificador del usuario colaborador del paquete especial"})
    altermateUserId: number

    @Column({ default: 1, comment: "Número de veces que se puede comprar un paquete en una sola compra desde el administrador" })
    max: number

    @Column('integer', { default: 0, comment: "Número de miembros que acepta el paquete grupal" })
    memberLimit: number

    @Column({ default: false, comment: "Bandera para indicar si el paquete es individual o de grupo" })
    isGroup: boolean

    @OneToMany(type => Purchase, purchase => purchase.Bundle)
    purchase: Purchase
}