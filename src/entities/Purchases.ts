import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { Bundle } from './Bundles'
import { Transaction } from './Transactions'
import { Payment_method } from './Payment_methods'
import { User } from './Users'

@Entity({name: 'purchases'})
export class Purchase {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    date: Date

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
}