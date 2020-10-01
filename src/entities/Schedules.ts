import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Timestamp, ManyToOne, JoinColumn } from 'typeorm'
import { Instructor } from './Instructors'
import { Booking } from './Bookings'
import { Room } from './Rooms'


@Entity({name: 'schedules'})
export class Schedule {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    date: Date

    @Column('time')
    end : Date

    @Column('time')
    start: Date

    @ManyToOne(type => Instructor, Instructor => Instructor.Schedule)
    @JoinColumn({name: 'instructors_id'})
    Instructor: Instructor

    @OneToMany(type => Booking, Booking => Booking.Schedule)
    Booking: Booking

    @ManyToOne(type => Room, Room => Room.Schedules)
    Rooms: Room

}
