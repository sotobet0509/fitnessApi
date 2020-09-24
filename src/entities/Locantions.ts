import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Room } from './Rooms'

@Entity({name: 'locations'})
export class Location {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    name: string

    @Column('text')
    address: string

    @OneToMany(type => Room, Room => Room.Location)
    Room: Room
}