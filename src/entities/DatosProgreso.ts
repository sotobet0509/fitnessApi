import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { Usuario } from './Usuarios'

@Entity({ name: 'datosProgreso' })
export class DatosProgreso {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico de los datos del paciente" })
    id: number

    @Column({ comment: "Peso" })
    peso: string

    @Column({ comment: "IMC" })
    imc: string

    @Column({ comment: "Grasa corporal" })
    grasa_corporal: string

    @Column({ comment: "Cintura" })
    cintura: string

    @Column({ comment: "Abdomen" })
    abdomen: string

    @Column({ comment: "Cadera" })
    cadera: string

    @Column({comment:"Fecha registro"})
    fecha_registro: Date


    @ManyToOne(type => Usuario, Usuario => Usuario.Datos)
    @JoinColumn({name: 'id_usuario'})
    Usuario: Usuario


}