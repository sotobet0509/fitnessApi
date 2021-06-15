import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Timestamp, ManyToOne, JoinColumn } from 'typeorm'
import { Instructor } from './Instructors'
import { Booking } from './Bookings'
import { Room } from './Rooms'


@Entity({name: 'schedules'})
export class Schedule {
    @PrimaryGeneratedColumn('increment', {comment: "Identificador numérico del horario"})
    id: number

    @Column({comment: "Fecha en que se dara la clase"})
    date: Date

    @Column('time', {comment: "Hora en que termina la clase"})
    end : Date

    @Column('time', {comment: "Hora en que comienza la clase"})
    start: Date

    @Column({nullable: true, comment: "Tematica de la clase"})
    theme:string

    @Column({default: false, comment: "Bandera que indica si la clase es publica o privada"})
    isPrivate: boolean

    @ManyToOne(type => Instructor, Instructor => Instructor.Schedule)
    @JoinColumn({name: 'instructors_id'})
    Instructor: Instructor

    @OneToMany(type => Booking, Booking => Booking.Schedule)
    Booking: Booking

    @ManyToOne(type => Room, Room => Room.Schedules)
    Rooms: Room

}
