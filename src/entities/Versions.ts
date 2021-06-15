import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinColumn, ManyToOne, CreateDateColumn } from 'typeorm'

@Entity({ name: 'versions' })
export class Version {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico de la versión" })
    id: number

    @Column({ comment: "Número de versión" })
    version: number

    @CreateDateColumn({ comment: "Fecha en que fue creada la versión" })
    createdAt: Date

}