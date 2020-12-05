import { type } from 'os'
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm'
import { Categories } from './categories'
import { User } from './Users'

@Entity({name: 'user_categories'})
export class User_categories {
    @PrimaryGeneratedColumn('increment')
    id: number

    @ManyToOne(type => User, User => User.User_categories)
    @JoinColumn({name: "User_id"})
    User: User

    @ManyToOne(type =>  Categories, Categories => Categories.User_categories)
    @JoinColumn({name: "Categories_id"})
    Categories: Categories

}