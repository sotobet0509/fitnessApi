import { join } from 'path'
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm'
import { Categories } from './Categories'

@Entity({name: 'user_items'})
export class User_items {
    @PrimaryGeneratedColumn('increment')
    id: number
    
    @Column()
    name: string

    @Column({nullable: true})
    description: string

    @Column()
    pictureUrl: string

    @OneToMany(type => Categories, Categories => Categories.User_items)
    Categories: Categories[]
}