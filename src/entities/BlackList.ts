import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinColumn, ManyToOne, CreateDateColumn } from 'typeorm'

@Entity({name: 'blackList'})
export class BlackList {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    token: string

    @CreateDateColumn()
    createdAt: Date  

}