import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Alternate_users } from './alternateUsers'

@Entity({name: 'folios'})
export class Folios {
    @PrimaryGeneratedColumn('increment')
    id: number
    
    @Column()
    folio: string

    @Column({default: true})
    isAviable: boolean

    @Column('integer')
    purchase: number
    
    @CreateDateColumn()
    createdAt: Date

    @Column({nullable: true})
    redeemAt: Date

    @Column()
    expirationDate: Date

    @Column()
    clientName: string

    @ManyToOne(type => Alternate_users, Alternate_users => Alternate_users.id )
    @JoinColumn({name: 'alternate_users_id'})
    Alternate_users: Alternate_users
}