import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm'
import { User } from './Users'

@Entity({name: 'classesHistory'})
export class ClassesHistory {
    @PrimaryGeneratedColumn('increment')
    id: number
    
    @Column()
    takenClasses: number

    @Column()
    takenPasses: number

    @Column()
    takenGroupClasses: number

    @OneToOne(type => User, User => User.ClassesHistory)
    @JoinColumn()
    User: User
}