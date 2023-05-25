import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { CategoriaEjercicios } from './CategoriasEjercicios'
import { Descansos } from './Descansos'
import { NombreEjercicio } from './NombreEjercicios'
import { Repeticiones } from './Repeticiones'
import { Series } from './Series'
import { Usuario } from './Usuarios'

@Entity({ name: 'ejercicios' })
export class Ejercicios {
    @PrimaryGeneratedColumn('increment', { comment: "Identificador numérico de los ejercicios del paciente" })
    id: number

    @Column({comment:"Fecha ejercicio"})
    fecha_ejercicio: Date

    @Column({ default: false, comment: "Bandera para indicar si el ejercicio ya se completó" })
    completado: boolean
    
    @ManyToOne(type => Usuario, Usuario => Usuario.Ejercicio)
    @JoinColumn({name: 'id_usuario'})
    Usuario: Usuario

    @ManyToOne(type => CategoriaEjercicios, CategoriaEjercicios => CategoriaEjercicios.id)
    @JoinColumn()
    Categoria_ejercicio: CategoriaEjercicios

    @ManyToOne(type => NombreEjercicio, NombreEjercicio => NombreEjercicio.id)
    @JoinColumn()
    Nombre_ejercicio: NombreEjercicio

    @ManyToOne(type => Series, Series => Series.id)
    @JoinColumn()
    Series: Series

    @ManyToOne(type => Repeticiones, Repeticiones => Repeticiones.id)
    @JoinColumn()
    Repeticiones: Repeticiones

    @Column({ comment: "Peso" })
    Peso: string
   
    @ManyToOne(type => Descansos, Descansos => Descansos.id)
    @JoinColumn()
    Descansos: Descansos
    
    @Column('json')
    Notas: { Nombre: string; nota: string }[]
}