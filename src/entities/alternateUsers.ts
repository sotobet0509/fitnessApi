import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Folios } from './Folios'


@Entity({name: 'alternate_Users'})
export class Alternate_users {
    @PrimaryGeneratedColumn('uuid')
    id: string
    
    @Column()
    email: string

    @Column()
    password: string

    @Column()
    name: string

    @Column({nullable: true})
    contact: string

    @OneToMany(type => Folios, Folios => Folios.Alternate_users)
    Folios: Folios
}