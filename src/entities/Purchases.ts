import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { Bundle } from './Bundles'
import { Transaction } from './Transactions'
import { Payment_method } from './Payment_methods'
import { User } from './Users'
import { Booking } from './Bookings'

@Entity({name: 'purchases'})
export class Purchase {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    date: Date

    @Column({default: 0})
    addedClasses: number
    
    @Column({default: 0})
    addedPasses: number

    @Column({default: false})
    isCanceled : boolean

    @Column({nullable: true, default: "1990-01-01 00:00:00"})
    expirationDate: Date

    @ManyToOne(type => Bundle, Bundle => Bundle.purchase)
    @JoinColumn({name: 'bundles_id'})
    Bundle: Bundle

    @OneToMany(type => Transaction, Transaction => Transaction.Purchase)
    Transaction: Transaction

    @ManyToOne(type => Payment_method, Payment_method => Payment_method.Purchase )
    @JoinColumn({name: 'payment_metods_id'})
    Payment_method: Payment_method

    @ManyToOne(type => User, User => User.Purchase)
    @JoinColumn({name: 'users_id'})
    User: User

    @OneToMany(type => Booking, Booking => Booking.fromPurchase)
    Booking: Booking
}