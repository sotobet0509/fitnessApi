import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'

@Entity({ name: 'series' })
export class Series {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico de la serie" })
    id: number

    @Column({ comment: "series" })
    series: number

}