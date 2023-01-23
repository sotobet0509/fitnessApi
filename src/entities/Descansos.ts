import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'


@Entity({ name: 'descansos' })
export class Descansos {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico del descanso" })
    id: number

    @Column({ comment: "descansos" })
    descansos: string
}