import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { Purchase } from './Purchases'

@Entity({ name: 'transactions' })
export class Transaction {
    @PrimaryGeneratedColumn('uuid', { comment: "Identificador del tipo UUID de la transacción" })
    id: string

    @Column({ nullable: true, comment: "Identificador que corresponde a la transacción realizada por evopayments" })
    voucher: string

    @Column({ comment: "Fecha de creación de la transacción" })
    date: Date

    @Column({ comment: "Bandera para indicar si se requiere factura" })
    invoice: boolean

    @Column('float', { comment: "Monto total de la transacción" })
    total: number

    @Column('text', { nullable: true, comment: "Campo para ingresar inforamción extra de la transacción" })
    comments: string

    @ManyToOne(type => Purchase, Purchase => Purchase.Transaction)
    @JoinColumn({ name: 'purchases_id' })
    Purchase: Purchase
}