import { type } from 'os'
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany } from 'typeorm'
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript'
import { Booking } from './Bookings'
import { Categories } from './Categories'
import { Purchase } from './Purchases'
import { User_categories } from './UserCategories'


@Entity({name: 'users'})
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    email: string

    @Column({nullable: true })
    lastname: string

    @Column({nullable: true })
    password: string

    @Column('text',{nullable: true })
    pictureUrl: string

    @Column({nullable: true })
    facebookId: string

    @Column( {nullable: true })
    googleId: string

    @Column({nullable: true })
    tempToken: string

    @Column( {default: false})
    isAdmin: boolean
    
    @Column({default: false})
    isDeleted: boolean

    @CreateDateColumn()
    createdAt: Date

    @OneToMany(type => Booking, Booking => Booking.User)
    Booking: Booking[]
    
    @OneToMany(type => Purchase, Purchase => Purchase.User)
    Purchase: Purchase[]

    @OneToMany(type => User_categories, User_categories => User_categories.User)
    User_categories: User_categories[]
}