import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Purchase } from './Purchases'


export enum type {
    EFECTIVO = 'efectivo',
    TARJETA = 'tarjeta',
  }

@Entity({name: 'payment_methods'})
export class Payment_method {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    name: string

    @Column('enum', {enum: type})
    type: type

    @OneToMany(type => Purchase, Purchase => Purchase.Payment_method)
    Purchase: Purchase
}