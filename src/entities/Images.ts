import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({ name: 'images' })
export class Images {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico de la imagen" })
    id: number

    @Column({ comment: "Path de la imagen" })
    url: string

    @Column({ default: true, comment: "Bandera para indicar si la imagen esta activa o no" })
    status: boolean

    @Column({ nullable: true, comment: "Sección a la que pertenece la imagen" })
    section: string

    @Column({comment: "Nombre de la imagen"})
    name: string
}