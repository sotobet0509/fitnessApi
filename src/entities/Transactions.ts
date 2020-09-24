import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { Purchase } from './Purchases'

@Entity({name: 'transactions'})
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: number

    @Column()
    date: Date

    @Column()
    invoice: boolean

    @Column('float')
    total: number

    @ManyToOne(type => Purchase, Purchase => Purchase.Transaction)
    @JoinColumn({name: 'purchases_id'})
    Purchase: Purchase
}