import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { Bundle } from './Bundles'
import { Transaction } from './Transactions'
import { Payment_method } from './Payment_methods'
import { User } from './Users'
import { Booking } from './Bookings'

export enum status {
    PENDING = 'Pendiente',
    ERROR = 'Error',
    FINISHED = 'Completada',
    CANCELED = 'Cancelada'
}

@Entity({ name: 'purchases' })
export class Purchase {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico de la compra" })
    id: number

    @Column({ comment: "Fecha en que es registrada la compra" })
    date: Date

    @Column({ default: 0, comment: "Número de clases extra o descontadas de la compra" })
    addedClasses: number

    @Column({ default: 0, comment: "Número de pases extra o descontadas de la compra" })
    addedPasses: number

    @Column({ default: false, comment: "Bandera para cancelar compras" })
    isCanceled: boolean

    @Column({ nullable: true, default: "1990-01-01 00:00:00", comment: "Fecha en que expira la compra del paquete" })
    expirationDate: Date

    @Column('enum', { enum: status, nullable: true, comment: "Estado en el que se encuentra la compra" })
    status: status

    @Column('float', { default: 0, comment: "Monto del paquete cuando fue iniciada la compra"})
    pendingAmount: number

    @Column({ comment: "Identificador que corresponde a la transacción realizada por evopayments" })
    operationIds: string

    @ManyToOne(type => Bundle, Bundle => Bundle.purchase)
    @JoinColumn({ name: 'bundles_id' })
    Bundle: Bundle

    @OneToMany(type => Transaction, Transaction => Transaction.Purchase)
    Transaction: Transaction

    @ManyToOne(type => Payment_method, Payment_method => Payment_method.Purchase)
    @JoinColumn({ name: 'payment_metods_id' })
    Payment_method: Payment_method

    @ManyToOne(type => User, User => User.Purchase)
    @JoinColumn({ name: 'users_id' })
    User: User

    @OneToMany(type => Booking, Booking => Booking.fromPurchase)
    Booking: Booking
}