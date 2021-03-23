import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinColumn, ManyToOne, CreateDateColumn } from 'typeorm'
import { User } from './Users'

export enum device {
    MOBILE = 'Mobile',
    DESKTOP = 'Desktop'
}

export enum conection {
    MOBILE = 'Mobile',
    WIFI = 'WiFi'
}

@Entity({name: 'survey1'})
export class Survey1 {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column('enum',{enum: device})
    device: device

    @Column()
    browser: string  

    @Column('enum',{enum: conection})
    conection: conection  

    @Column('text')
    description: string

    @Column({nullable : true})
    url: string

    @CreateDateColumn()
    createdAt: Date

    @ManyToOne(type => User, User => User.Survey1)
    @JoinColumn()
    User: User

}