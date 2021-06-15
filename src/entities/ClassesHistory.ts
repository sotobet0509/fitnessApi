import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm'
import { User } from './Users'

@Entity({ name: 'classesHistory' })
export class ClassesHistory {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico del historial de clases y pases tomados por el cliente" })
    id: number

    @Column({ comment: "Número de clases individuales tomadas" })
    takenClasses: number

    @Column({ comment: "Número de pases individuales tomados" })
    takenPasses: number

    @Column({ comment: "Número de clases grupales tomadas" })
    takenGroupClasses: number

    @OneToOne(type => User, User => User.ClassesHistory)
    @JoinColumn()
    User: User
}