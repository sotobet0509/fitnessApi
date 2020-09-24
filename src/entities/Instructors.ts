import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
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

    @OneToMany(type => Schedule, Schedule => Schedule.Instructor)
    Schedule: Schedule
    
}