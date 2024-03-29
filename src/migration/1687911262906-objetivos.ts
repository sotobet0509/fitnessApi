import {MigrationInterface, QueryRunner} from "typeorm";

export class objetivos1687911262906 implements MigrationInterface {
    name = 'objetivos1687911262906'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `nombreEjercicio` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico del ejercicio', `nombre_ejercicio` varchar(255) NOT NULL COMMENT 'nombre_ejercicio', `url_gif` varchar(255) NOT NULL COMMENT 'gif ejercicio', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `ejerciciosCategoria` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico de los ejercicios por categoria', `id_nombre_ejercicio` int NULL COMMENT 'Identificador numérico del ejercicio', `id_categoria_ejercicio` int NULL COMMENT 'Identificador numérico del ejercicio', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `categoria` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico del ejercicio', `categoria` varchar(255) NOT NULL COMMENT 'nombre_categoria', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `datosProgreso` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico de los datos del paciente', `pliegues_Tricipital` int NOT NULL COMMENT 'pliegues_Tricipital', `pliegues_Subescapular` int NOT NULL COMMENT 'pliegues_Subescapular', `pliegues_Bicipital` int NOT NULL COMMENT 'pliegues_Bicipital', `pliegues_Cresta_ilíaca` int NOT NULL COMMENT 'pliegues_Cresta ilíaca ', `pliegues_Supraespinal` int NOT NULL COMMENT 'pliegues_Supraespinal', `pliegues_Abdominal` int NOT NULL COMMENT 'pliegues_Abdominal', `pliegues_Muslo` int NOT NULL COMMENT 'pliegues_Muslo', `pliegues_Pantorrilla` int NOT NULL COMMENT 'pliegues_Pantorrilla', `perimetros_cintura` int NOT NULL COMMENT 'Cintura', `perimetros_abdomen` int NOT NULL COMMENT 'Abdomen', `perimetros_cadera` int NOT NULL COMMENT 'Cadera', `perimetros_brazo_contraido` int NOT NULL COMMENT 'Cintura', `perimetros_muslo` int NOT NULL COMMENT 'Abdomen', `perimetros_pantorrilla` int NOT NULL COMMENT 'Cadera', `resultados_peso` int NOT NULL COMMENT 'Peso', `resultados_grasa_corporal` int NOT NULL COMMENT 'Grasa corporal', `resultados_kg_grasa` int NOT NULL COMMENT 'Kg Grasa', `resultados_kg_musculo` int NOT NULL COMMENT 'Kg musculo', `resultados_suma_pliegues` int NOT NULL COMMENT 'Suma pliegues', `fecha_registro` datetime NOT NULL COMMENT 'Fecha registro', `id_usuario` varchar(36) NULL COMMENT 'Identificador del tipo UUID del usuario', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `dietas` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico de la dieta', `fecha_dieta` datetime NOT NULL COMMENT 'Fecha de la dieta', `url` varchar(255) NOT NULL COMMENT 'Url dieta', `id_usuario` varchar(36) NULL COMMENT 'Identificador del tipo UUID del usuario', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `descansos` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico del descanso', `descansos` varchar(255) NOT NULL COMMENT 'descansos', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `repeticiones` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico de la repeticiones', `repeticiones` varchar(255) NOT NULL COMMENT 'repeticiones', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `series` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico de la serie', `series` int NOT NULL COMMENT 'series', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `ejercicios` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico de los ejercicios del paciente', `fecha_ejercicio` datetime NOT NULL COMMENT 'Fecha ejercicio', `completado` tinyint NOT NULL COMMENT 'Bandera para indicar si el ejercicio ya se completó' DEFAULT 0, `Peso` varchar(255) NOT NULL COMMENT 'Peso', `Notas` json NOT NULL, `id_usuario` varchar(36) NULL COMMENT 'Identificador del tipo UUID del usuario', `categoriaEjercicioId` int NULL COMMENT 'Identificador numérico del ejercicio', `nombreEjercicioId` int NULL COMMENT 'Identificador numérico del ejercicio', `seriesId` int NULL COMMENT 'Identificador numérico de la serie', `repeticionesId` int NULL COMMENT 'Identificador numérico de la repeticiones', `descansosId` int NULL COMMENT 'Identificador numérico del descanso', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `fotosUsuarios` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico de la imagen', `url` text NOT NULL COMMENT 'Path de la imagen', `fecha_foto` datetime NOT NULL COMMENT 'Fecha de creación de la foto', `categoria` varchar(255) NOT NULL COMMENT 'Categoria de la foto', `id_usuario` varchar(36) NULL COMMENT 'Identificador del tipo UUID del usuario', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `pasos` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico del registro de pasos', `fecha_registro` datetime NOT NULL COMMENT 'Fecha del registro de pasos ', `cantidad` int NOT NULL COMMENT 'cantidad de pasos', `id_usuario` varchar(36) NULL COMMENT 'Identificador del tipo UUID del usuario', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `objetivos` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico del registro de objetivos', `fecha_registro` datetime NOT NULL COMMENT 'Fecha del registro del objetivo ', `Descripcion` varchar(255) NOT NULL COMMENT 'descripcion', `completado` tinyint NOT NULL COMMENT 'Bandera para indicar si el objetivo ya se cumplio' DEFAULT 0, `id_usuario` varchar(36) NULL COMMENT 'Identificador del tipo UUID del usuario', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `usuarios` (`idUsuario` varchar(36) NOT NULL COMMENT 'Identificador del tipo UUID del usuario', `nombre` varchar(255) NOT NULL COMMENT 'Nombre del usuario', `fechaNacimiento` datetime NOT NULL COMMENT 'Fecha de nacimiento del usuario', `email` varchar(255) NOT NULL COMMENT 'Correo electrónico del usuario', `contrasena` varchar(255) NULL COMMENT 'Contraseña del usuario hasheada', `urlFoto` text NULL COMMENT 'Path de la foto de perfil del usuario', `genero` varchar(255) NOT NULL COMMENT 'Genero del usuario', `esAdministrador` tinyint NOT NULL COMMENT 'Bandera para indicar si el usuario es administrador' DEFAULT 0, `tempToken` varchar(255) NULL COMMENT 'Token temporal cambio de contraseñas', `activo` tinyint NOT NULL COMMENT 'Borrado logico del usuario' DEFAULT 0, `seccion_ejercicios` tinyint NOT NULL COMMENT 'Bandera para indicar si tiene activa la seccion de ejercicios' DEFAULT 0, PRIMARY KEY (`idUsuario`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `citas` (`id` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador numérico de la cita', `fecha_cita` datetime NOT NULL COMMENT 'Fecha de la cita', `lugar` varchar(255) NOT NULL COMMENT 'Lugar de la cita', `id_usuario` varchar(36) NULL COMMENT 'Identificador del tipo UUID del usuario', PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `ejerciciosCategoria` ADD CONSTRAINT `FK_702ff835389d2a843b016d62ea5` FOREIGN KEY (`id_nombre_ejercicio`) REFERENCES `nombreEjercicio`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `ejerciciosCategoria` ADD CONSTRAINT `FK_71e1fa80f2a7d7d1efea9756161` FOREIGN KEY (`id_categoria_ejercicio`) REFERENCES `categoria`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `datosProgreso` ADD CONSTRAINT `FK_f9871f6f23d4c45e58534a72301` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `dietas` ADD CONSTRAINT `FK_328eb9659656c53fd4a5d5e601f` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `ejercicios` ADD CONSTRAINT `FK_e3514ce768a5832f56372732ed2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `ejercicios` ADD CONSTRAINT `FK_0fd36510137509a82decd6178ac` FOREIGN KEY (`categoriaEjercicioId`) REFERENCES `categoria`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `ejercicios` ADD CONSTRAINT `FK_fbf0791199b0e2ad0118e906585` FOREIGN KEY (`nombreEjercicioId`) REFERENCES `nombreEjercicio`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `ejercicios` ADD CONSTRAINT `FK_e4fc50e2effb18265bf7be79cfb` FOREIGN KEY (`seriesId`) REFERENCES `series`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `ejercicios` ADD CONSTRAINT `FK_ac541984b06d75b9d6bd144d603` FOREIGN KEY (`repeticionesId`) REFERENCES `repeticiones`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `ejercicios` ADD CONSTRAINT `FK_fb8504a3c139af77d0990506b06` FOREIGN KEY (`descansosId`) REFERENCES `descansos`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `fotosUsuarios` ADD CONSTRAINT `FK_c765c59a3ff70d3299579515855` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `pasos` ADD CONSTRAINT `FK_048c0b429680d92a2fe68a9d64f` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `objetivos` ADD CONSTRAINT `FK_50caf296ab3378ef42b40fc04d1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `citas` ADD CONSTRAINT `FK_e143566abee4656c45bba5b21b5` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `citas` DROP FOREIGN KEY `FK_e143566abee4656c45bba5b21b5`");
        await queryRunner.query("ALTER TABLE `objetivos` DROP FOREIGN KEY `FK_50caf296ab3378ef42b40fc04d1`");
        await queryRunner.query("ALTER TABLE `pasos` DROP FOREIGN KEY `FK_048c0b429680d92a2fe68a9d64f`");
        await queryRunner.query("ALTER TABLE `fotosUsuarios` DROP FOREIGN KEY `FK_c765c59a3ff70d3299579515855`");
        await queryRunner.query("ALTER TABLE `ejercicios` DROP FOREIGN KEY `FK_fb8504a3c139af77d0990506b06`");
        await queryRunner.query("ALTER TABLE `ejercicios` DROP FOREIGN KEY `FK_ac541984b06d75b9d6bd144d603`");
        await queryRunner.query("ALTER TABLE `ejercicios` DROP FOREIGN KEY `FK_e4fc50e2effb18265bf7be79cfb`");
        await queryRunner.query("ALTER TABLE `ejercicios` DROP FOREIGN KEY `FK_fbf0791199b0e2ad0118e906585`");
        await queryRunner.query("ALTER TABLE `ejercicios` DROP FOREIGN KEY `FK_0fd36510137509a82decd6178ac`");
        await queryRunner.query("ALTER TABLE `ejercicios` DROP FOREIGN KEY `FK_e3514ce768a5832f56372732ed2`");
        await queryRunner.query("ALTER TABLE `dietas` DROP FOREIGN KEY `FK_328eb9659656c53fd4a5d5e601f`");
        await queryRunner.query("ALTER TABLE `datosProgreso` DROP FOREIGN KEY `FK_f9871f6f23d4c45e58534a72301`");
        await queryRunner.query("ALTER TABLE `ejerciciosCategoria` DROP FOREIGN KEY `FK_71e1fa80f2a7d7d1efea9756161`");
        await queryRunner.query("ALTER TABLE `ejerciciosCategoria` DROP FOREIGN KEY `FK_702ff835389d2a843b016d62ea5`");
        await queryRunner.query("DROP TABLE `citas`");
        await queryRunner.query("DROP TABLE `usuarios`");
        await queryRunner.query("DROP TABLE `objetivos`");
        await queryRunner.query("DROP TABLE `pasos`");
        await queryRunner.query("DROP TABLE `fotosUsuarios`");
        await queryRunner.query("DROP TABLE `ejercicios`");
        await queryRunner.query("DROP TABLE `series`");
        await queryRunner.query("DROP TABLE `repeticiones`");
        await queryRunner.query("DROP TABLE `descansos`");
        await queryRunner.query("DROP TABLE `dietas`");
        await queryRunner.query("DROP TABLE `datosProgreso`");
        await queryRunner.query("DROP TABLE `categoria`");
        await queryRunner.query("DROP TABLE `ejerciciosCategoria`");
        await queryRunner.query("DROP TABLE `nombreEjercicio`");
    }

}
