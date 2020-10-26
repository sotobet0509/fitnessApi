import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinColumn, ManyToOne, CreateDateColumn } from 'typeorm'

@Entity({name: 'versions'})
export class Version {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    version: number

    @CreateDateColumn()
    createdAt: Date  

}