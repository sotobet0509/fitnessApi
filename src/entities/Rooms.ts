import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinColumn, ManyToOne } from 'typeorm'
import { Location } from './Locantions'
import { Schedule } from './Schedules'
import { Seat } from './Seats'
 
@Entity({name: 'rooms'})
export class Room {
    @PrimaryGeneratedColumn('increment', {comment: "Identificador numérico del salón"})
    id: number

    @Column({comment: "Nombre del salon"})
    name: string

    @Column('text',{comment: "Descripción del salón"})
    description: string

    @ManyToOne(type => Location, Location => Location.Room)
    @JoinColumn({name: 'locations_id'})
    Location: Location

    @OneToMany(type => Seat, Seat => Seat.Room)
    Seat: Seat[]

    @OneToMany(type => Schedule, Schedule => Schedule.Rooms)
    Schedules: Schedule[]

}