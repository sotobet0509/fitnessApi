import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({ name: 'discounts' })
export class Discounts {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador del descuento" })
    id: number

    @Column({ comment: "Motivo del descuento" })
    description: string
}