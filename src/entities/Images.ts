import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'

@Entity({name: 'images'})
export class Images {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    url: string
}