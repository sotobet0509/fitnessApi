import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { Booking } from './Bookings'
import { Room } from './Rooms'

@Entity({name: 'seats'})
export class Seat {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    number: string

    @Column()
    bookings_id: number

    @OneToMany(type => Booking, Booking => Booking.Seat)
    Booking: Booking

    @ManyToOne(type => Room, Room => Room.Seat)
    @JoinColumn({name: 'rooms_id'})
    Room: Room

}