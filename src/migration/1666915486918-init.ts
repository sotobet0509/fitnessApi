import {MigrationInterface, QueryRunner} from "typeorm";

export class init1666915486918 implements MigrationInterface {
    name = 'init1666915486918'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `citas` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico de la cita', `fecha_cita` datetime NOT NULL COMMENT 'Fecha de la cita', `lugar` varchar(255) NOT NULL COMMENT 'Lugar de la cita', `id_usuario` varchar(36) NULL COMMENT 'Identificador del tipo UUID del usuario', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `datosProgreso` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico de los datos del paciente', `peso` varchar(255) NOT NULL COMMENT 'Peso', `imc` varchar(255) NOT NULL COMMENT 'IMC', `grasa_corporal` varchar(255) NOT NULL COMMENT 'Grasa corporal', `cintura` varchar(255) NOT NULL COMMENT 'Cintura', `abdomen` varchar(255) NOT NULL COMMENT 'Abdomen', `cadera` varchar(255) NOT NULL COMMENT 'Cadera', `pasos` int NOT NULL COMMENT 'Pasos', `fecha_registro` datetime NOT NULL COMMENT 'Fecha registro', `id_usuario` varchar(36) NULL COMMENT 'Identificador del tipo UUID del usuario', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `fotosUsuarios` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico de la imagen', `url` text NOT NULL COMMENT 'Path de la imagen', `fecha_foto` datetime NOT NULL COMMENT 'Fecha de creación de la foto', `id_usuario` varchar(36) NULL COMMENT 'Identificador del tipo UUID del usuario', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `usuarios` (`idUsuario` varchar(36) NOT NULL COMMENT 'Identificador del tipo UUID del usuario', `nombre` varchar(255) NOT NULL COMMENT 'Nombre del usuario', `fechaNacimiento` datetime NOT NULL COMMENT 'Fecha de nacimiento del usuario', `email` varchar(255) NOT NULL COMMENT 'Correo electrónico del usuario', `contrasena` varchar(255) NULL COMMENT 'Contraseña del usuario hasheada', `urlFoto` text NULL COMMENT 'Path de la foto de perfil del usuario', `genero` varchar(255) NOT NULL COMMENT 'Genero del usuario', `esAdministrador` tinyint NOT NULL COMMENT 'Bandera para indicar si el usuario es administrador' DEFAULT 0, `tempToken` varchar(255) NULL COMMENT 'Token temporal cambio de contraseñas', `activo` tinyint NOT NULL COMMENT 'Borrado logico del usuario' DEFAULT 0, `seccion_ejercicios` tinyint NOT NULL COMMENT 'Bandera para indicar si tiene activa la seccion de ejercicios' DEFAULT 0, PRIMARY KEY (`idUsuario`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `ejercicios` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico de los ejercicios del paciente', `fecha_ejercicio` datetime NOT NULL COMMENT 'Fecha ejercicio', `completado` tinyint NOT NULL COMMENT 'Bandera para indicar si el ejercicio ya se completó' DEFAULT 0, `id_usuario` varchar(36) NULL COMMENT 'Identificador del tipo UUID del usuario', `id_ejercicio` int NULL COMMENT 'Identificador numérico del ejercicio', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `catalogoEjercicios` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico del ejercicio', `nombre_ejercicio` varchar(255) NOT NULL COMMENT 'Cadera', `serie` varchar(255) NOT NULL COMMENT 'Cadera', `repeticiones` varchar(255) NOT NULL COMMENT 'Cadera', `peso` varchar(255) NOT NULL COMMENT 'Cadera', `descanso` varchar(255) NOT NULL COMMENT 'Cadera', `notas` varchar(255) NOT NULL COMMENT 'Cadera', `urlReferencia` text NOT NULL COMMENT 'Cadera', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `citas` ADD CONSTRAINT `FK_e143566abee4656c45bba5b21b5` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `datosProgreso` ADD CONSTRAINT `FK_f9871f6f23d4c45e58534a72301` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `fotosUsuarios` ADD CONSTRAINT `FK_c765c59a3ff70d3299579515855` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `ejercicios` ADD CONSTRAINT `FK_e3514ce768a5832f56372732ed2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `ejercicios` ADD CONSTRAINT `FK_66eb0f278f8e6d102a2675e2608` FOREIGN KEY (`id_ejercicio`) REFERENCES `catalogoEjercicios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `ejercicios` DROP FOREIGN KEY `FK_66eb0f278f8e6d102a2675e2608`");
        await queryRunner.query("ALTER TABLE `ejercicios` DROP FOREIGN KEY `FK_e3514ce768a5832f56372732ed2`");
        await queryRunner.query("ALTER TABLE `fotosUsuarios` DROP FOREIGN KEY `FK_c765c59a3ff70d3299579515855`");
        await queryRunner.query("ALTER TABLE `datosProgreso` DROP FOREIGN KEY `FK_f9871f6f23d4c45e58534a72301`");
        await queryRunner.query("ALTER TABLE `citas` DROP FOREIGN KEY `FK_e143566abee4656c45bba5b21b5`");
        await queryRunner.query("DROP TABLE `catalogoEjercicios`");
        await queryRunner.query("DROP TABLE `ejercicios`");
        await queryRunner.query("DROP TABLE `usuarios`");
        await queryRunner.query("DROP TABLE `fotosUsuarios`");
        await queryRunner.query("DROP TABLE `datosProgreso`");
        await queryRunner.query("DROP TABLE `citas`");
    }

}
