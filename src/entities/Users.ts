import { Entity, PrimaryGeneratedColumn, Column, OneToMany, PromiseUtils } from 'typeorm'
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript'
import { Booking } from './Bookings'
import { Purchase } from './Purchases'


@Entity({name: 'users'})
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    email: string

    @Column()
    lastname: string

    @Column({nullable: true })
    password: string

    @Column('text')
    pictureurl: string

    @Column({nullable: true })
    facebookId: string

    @Column( {nullable: true })
    googleId: string

    @Column({nullable: true })
    temptoken: string

    @OneToMany(type => Booking, Booking => Booking.User)
    Booking: Booking
    
    @OneToMany(type => Purchase, Purchase => Purchase.User)
    Purchase: Purchase
}