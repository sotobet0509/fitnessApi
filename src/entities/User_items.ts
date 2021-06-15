import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm'
import { Categories } from './Categories'

@Entity({ name: 'user_items' })
export class User_items {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador de tabla intermedia de Items y categorias" })
    id: number

    @Column({ comment: "Nombre del item" })
    name: string

    @Column({ nullable: true, comment: "Información del item" })
    description: string

    @Column({ comment: "	Path de la imagen del item" })
    pictureUrl: string

    @OneToMany(type => Categories, Categories => Categories.User_items)
    Categories: Categories[]
}