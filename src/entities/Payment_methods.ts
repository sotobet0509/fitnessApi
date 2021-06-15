import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Purchase } from './Purchases'


export enum type {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta'
}

@Entity({ name: 'payment_methods' })
export class Payment_method {
  @PrimaryGeneratedColumn('increment', { comment: "identificador numérico del metodo de pago" })
  id: number

  @Column({ comment: "Nombre del método de pago" })
  name: string

  @Column('enum', { enum: type, comment: "Tipo de método de pago" })
  type: type

  @OneToMany(type => Purchase, Purchase => Purchase.Payment_method)
  Purchase: Purchase
}