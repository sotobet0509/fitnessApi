import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, CreateDateColumn } from 'typeorm'
import { Schedule } from './Schedules'
import { Seat } from './Seats'
import { User } from './Users'

@Entity({name: 'bookings'})
export class Booking {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({default: false})
    isPass: boolean

    @CreateDateColumn()
    createdAt: Date

    @Column()
    fromBundle: number

    @ManyToOne(type => Schedule, Schedule => Schedule.Booking)
    @JoinColumn({name: 'schedules_id'})
    Schedule: Schedule

    @ManyToOne(type => Seat, Seat => Seat.Booking)
    @JoinColumn({name: 'seats_id'})
    Seat: Seat    
  
    @ManyToOne(type => User, User => User.Booking)
    @JoinColumn({name: 'user_id'})
    User: User



}