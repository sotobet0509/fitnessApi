import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { Usuario } from './Usuarios'

@Entity({ name: 'datosProgreso' })
export class DatosProgreso {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico de los datos del paciente" })
    id: number
    //pliegues
    @Column({ comment: "pliegues_Tricipital" })
    pliegues_Tricipital: number

    @Column({ comment: "pliegues_Subescapular" })
    pliegues_Subescapular: number

    @Column({ comment: "pliegues_Bicipital" })
    pliegues_Bicipital: number

    @Column({ comment: "pliegues_Cresta ilíaca " })
    pliegues_Cresta_ilíaca : number

    @Column({ comment: "pliegues_Supraespinal" })
    pliegues_Supraespinal: number

    @Column({ comment: "pliegues_Abdominal" })
    pliegues_Abdominal: number

    @Column({ comment: "pliegues_Muslo" })
    pliegues_Muslo: number

    @Column({ comment: "pliegues_Pantorrilla" })
    pliegues_Pantorrilla: number

    //perimetros
   

    @Column({ comment: "Cintura" })
    perimetros_cintura: string

    @Column({ comment: "Abdomen" })
    perimetros_abdomen: string

    @Column({ comment: "Cadera" })
    perimetros_cadera: string

    @Column({ comment: "Cintura" })
    perimetros_brazo_contraido: string

    @Column({ comment: "Abdomen" })
    perimetros_muslo: string

    @Column({ comment: "Cadera" })
    perimetros_pantorrilla: string
    //resultados

    @Column({ comment: "Peso" })
    resultados_peso: string

    @Column({ comment: "Grasa corporal" })
    resultados_grasa_corporal: string

    @Column({ comment: "Kg Grasa" })
    resultados_kg_grasa: string

    @Column({ comment: "Kg musculo" })
    resultados_kg_musculo: string

    @Column({ comment: "Suma pliegues" })
    resultados_suma_pliegues: number


    @Column({comment:"Fecha registro"})
    fecha_registro: Date


    @ManyToOne(type => Usuario, Usuario => Usuario.Datos)
    @JoinColumn({name: 'id_usuario'})
    Usuario: Usuario


}