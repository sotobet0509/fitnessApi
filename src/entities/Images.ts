import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({name: 'images'})
export class Images {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    url: string

    @Column({default: true})
    status: boolean

    @Column({nullable: true})
    section: string

    @Column()
    name: string
}