import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Generated, ManyToMany, OneToOne } from 'typeorm'
import { Citas } from './Citas'
import { DatosProgreso } from './DatosProgreso'
import { Dietas } from './Dietas'
import { Ejercicios } from './Ejercicios'
import { FotosUsuarios } from './FotosUsuarios'
import { Pasos } from './PasosUsuarios'
import { Objetivos } from './Objetivos'



@Entity({ name: 'usuarios' })
export class Usuario {
    @PrimaryGeneratedColumn('uuid', { comment: "Identificador del tipo UUID del usuario" })
    idUsuario: string

    @Column({ comment: "Nombre del usuario" })
    nombre: string

    @Column({comment:"Fecha de nacimiento del usuario"})
    fechaNacimiento: Date

    @Column({ comment: "Correo electrónico del usuario" })
    email: string

    @Column({ nullable: true, comment: "Contraseña del usuario hasheada" })
    contrasena: string

    @Column('text', { nullable: true, comment: "Path de la foto de perfil del usuario" })
    urlFoto: string

    @Column({comment:"Genero del usuario"})
    genero: String

    @Column({ default: false, comment: "Bandera para indicar si el usuario es administrador" })
    esAdministrador: boolean

    @Column({ nullable: true, comment: "Token temporal cambio de contraseñas" })
    tempToken: string
    
    @Column({ default: false, comment: "Borrado logico del usuario" })
    activo: boolean

    @Column({ default: false, comment: "Bandera para indicar si tiene activa la seccion de ejercicios" })
    seccion_ejercicios: boolean
    
    @OneToMany(type => FotosUsuarios, Fotos => Fotos.Usuario)
    Foto: FotosUsuarios[]

    @OneToMany(type => Citas, Citas => Citas.Usuario)
    Cita: Citas[]

    @OneToMany(type => Dietas, Dietas => Dietas.Usuario)
    Dietas: Citas[]

    @OneToMany(type => DatosProgreso, Datos => Datos.Usuario)
    Datos: DatosProgreso[]

    @OneToMany(type => Ejercicios, Ejercicios => Ejercicios.Usuario)
    Ejercicio: Ejercicios[]

    @OneToMany(type => Pasos, Pasos => Pasos.Usuario)
    Pasos: Pasos[]

     @OneToMany(type => Objetivos, objetivos => objetivos.Usuario)
     objetivos: Objetivos[]
    

}