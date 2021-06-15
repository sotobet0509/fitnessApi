import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Alternate_users } from './alternateUsers'

@Entity({ name: 'folios' })
export class Folios {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico del folio" })
    id: number

    @Column({ comment: "Código para reclamar un folio" })
    folio: string

    @Column({ default: true, comment: "Bandera para indicar si el folio ya fue reclamado" })
    isAviable: boolean

    @Column('integer', { comment: "Compra a la que pertenece el folio" })
    purchase: number

    @CreateDateColumn({ comment: "Fecha en que fue creada el folio" })
    createdAt: Date

    @Column({ nullable: true, comment: "Fecha en que fue reclamado el folio" })
    redeemAt: Date

    @Column({ comment: "Fecha en que expira el folio" })
    expirationDate: Date

    @Column({ comment: "Nombre del cliente al que pertenece el folio" })
    clientName: string

    @ManyToOne(type => Alternate_users, Alternate_users => Alternate_users.id)
    @JoinColumn({ name: 'alternate_users_id' })
    Alternate_users: Alternate_users
}