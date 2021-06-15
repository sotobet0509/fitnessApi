import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinColumn, ManyToOne, CreateDateColumn } from 'typeorm'

@Entity({name: 'blackList'})
export class BlackList {
    @PrimaryGeneratedColumn('increment', {comment: "Identificador numérico de la lista negra"})
    id: number

    @Column({comment: "Token del usuario a ingresar en lista negra"})
    token: string

    @CreateDateColumn({comment: "Fecha en que se ingreso a la lista negra"})
    createdAt: Date  

}