import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'


@Entity({ name: 'repeticiones' })
export class Repeticiones {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico de la repeticiones" })
    id: number

    @Column({ comment: "repeticiones" })
    repeticiones: string

}