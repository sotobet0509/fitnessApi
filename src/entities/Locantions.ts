import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Room } from './Rooms'

@Entity({ name: 'locations' })
export class Location {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico de la locación" })
    id: number

    @Column({ comment: "Nombre de la locación" })
    name: string

    @Column('text', { comment: "Dirección de la locación" })
    address: string

    @OneToMany(type => Room, Room => Room.Location)
    Room: Room
}