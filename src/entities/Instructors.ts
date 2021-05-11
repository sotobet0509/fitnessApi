import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm'
import { Schedule} from './Schedules'

@Entity({name: 'instructors'})
export class Instructor {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    name: string

    @Column()
    lastname: string

    @Column('text')
    description: string

    @Column('text')
    profilePicture: string

    @Column('text')
    largePicture: string
   
    @Column()
    isDeleted: boolean
    
    @Column({default: true})
    isVisible: boolean

    @CreateDateColumn()
    createdAt: Date

    @Column({nullable: true})
    email: string

    @Column({nullable: true })
    password: string
    
    @OneToMany(type => Schedule, Schedule => Schedule.Instructor)
    Schedule: Schedule
    
}