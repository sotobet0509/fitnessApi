import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({name: 'discounts'})
export class Discounts {
    @PrimaryGeneratedColumn('increment')
    id: number
    
    @Column()
    description: string
}