import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'

@Entity({name: 'discounts'})
export class Discounts {
    @PrimaryGeneratedColumn('increment')
    id: number
    
    @Column()
    description: string
}