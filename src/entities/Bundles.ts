import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import {Purchase} from './Purchases'

@Entity({name: 'bundles'})
export class Bundle {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    name: string

    @Column('float')
    price: number

    @Column('float')
    offer: number

    @Column()
    description: string

    @Column('integer')
    classNumber: number

    @Column('integer')
    expirationDays: number

    @Column('integer')
    passes: number

    @Column()
    isDeleted: boolean

    @Column()
    isRecurrent: boolean

    @Column({default: false})
    isUnlimited: boolean

    @Column({default: false})
    isEspecial: boolean

    @Column({nullable: true})
    especialDescription: string

    @Column('integer', {nullable: true})
    promotionExpirationDays: number

    @Column({nullable: true})
    pictureUrl: string

    @Column('integer')
    altermateUserId: number

    @OneToMany(type => Purchase, purchase => purchase.Bundle)
    purchase: Purchase    
}