import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity({name: 'images'})
export class Images {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    url: string
}