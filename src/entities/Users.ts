import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany } from 'typeorm'
import { Booking } from './Bookings'
import { Purchase } from './Purchases'
import { Questions } from './questions'
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

    @Column({default: false})
    isLeader: boolean

    @Column( {nullable: true })
    fromGroup: string

    @Column( {nullable: true })
    groupName: string

    @Column({default: 0})
    changed: number

    @OneToMany(type => Booking, Booking => Booking.User)
    Booking: Booking[]
    
    @OneToMany(type => Purchase, Purchase => Purchase.User)
    Purchase: Purchase[]

    @OneToMany(type => User_categories, User_categories => User_categories.User)
    User_categories: User_categories[]

    @OneToMany(type => Questions, Questions => Questions.User)
    Questions: Questions
}