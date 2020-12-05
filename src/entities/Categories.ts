import { table } from 'console'
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm'
import { User_categories } from './UserCategories'
import { User } from './Users'
import { User_items } from './User_items'

@Entity({name: 'categories'})
export class Categories {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    name: string

    @Column({nullable: true})
    description: string

    @Column()
    type: string

    @ManyToOne(type => User_items, User_items => User_items.Categories)
    @JoinColumn({name: 'user_items_id'})
    User_items: User_items[]    

    @OneToMany(type => User_categories, User_categories => User_categories.Categories)
    User_categories: User_categories[]

}