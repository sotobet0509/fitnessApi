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
    perimetros_cintura: number

    @Column({ comment: "Abdomen" })
    perimetros_abdomen: number

    @Column({ comment: "Cadera" })
    perimetros_cadera: number

    @Column({ comment: "Cintura" })
    perimetros_brazo_contraido: number

    @Column({ comment: "Abdomen" })
    perimetros_muslo: number

    @Column({ comment: "Cadera" })
    perimetros_pantorrilla: number
    //resultados

    @Column({ comment: "Peso" })
    resultados_peso: number

    @Column({ comment: "Grasa corporal" })
    resultados_grasa_corporal: number

    @Column({ comment: "Kg Grasa" })
    resultados_kg_grasa: number

    @Column({ comment: "Kg musculo" })
    resultados_kg_musculo: number

    @Column({ comment: "Suma pliegues" })
    resultados_suma_pliegues: number


    @Column({comment:"Fecha registro"})
    fecha_registro: Date


    @ManyToOne(type => Usuario, Usuario => Usuario.Datos)
    @JoinColumn({name: 'id_usuario'})
    Usuario: Usuario


}