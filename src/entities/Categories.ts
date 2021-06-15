import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm'
import { User_categories } from './UserCategories'
import { User_items } from './User_items'

@Entity({name: 'categories'})
export class Categories {
    @PrimaryGeneratedColumn('increment', {comment: "Identificador numérico de las categorías"})
    id: number

    @Column({comment: "Nombre de la categoría"})
    name: string

    @Column({nullable: true, comment: "Descripción de la categoría"})
    description: string

    @Column({comment: "Tipo de categoría"})
    type: string

    @ManyToOne(type => User_items, User_items => User_items.Categories)
    @JoinColumn({name: 'user_items_id'})
    User_items: User_items[]    

    @OneToMany(type => User_categories, User_categories => User_categories.Categories)
    User_categories: User_categories[]

}