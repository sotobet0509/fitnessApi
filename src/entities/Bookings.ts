import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, CreateDateColumn } from 'typeorm'
import { Purchase } from './Purchases'
import { Schedule } from './Schedules'
import { Seat } from './Seats'
import { User } from './Users'

@Entity({name: 'bookings'})
export class Booking {
    @PrimaryGeneratedColumn('increment', {comment: "Identificador numérico de la reservación"})
    id: number

    @Column({default: false, comment: "Bandera para indicar si es reservación de tipo Clase o Pase"})
    isPass: boolean

    @CreateDateColumn({comment: "Fecha en la que fue creada la reservación"})
    createdAt: Date

    @Column({default: false, comment: "Bandera para pasar lista de los usuarios que acuden a la clase"})
    assistance: boolean

    @ManyToOne(type => Schedule, Schedule => Schedule.Booking)
    @JoinColumn({name: 'schedules_id'})
    Schedule: Schedule

    @ManyToOne(type => Seat, Seat => Seat.Booking)
    @JoinColumn({name: 'seats_id'})
    Seat: Seat    
  
    @ManyToOne(type => User, User => User.Booking)
    @JoinColumn({name: 'user_id'})
    User: User

    @ManyToOne(type => Purchase, Purchase => Purchase.Booking)
    @JoinColumn({name: 'fromPurchase'})
    fromPurchase: Purchase
}