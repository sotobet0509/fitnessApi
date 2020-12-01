import {MigrationInterface, QueryRunner} from "typeorm";

export class instructores1606778952368 implements MigrationInterface {
    name = 'instructores1606778952368'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `folios` (`id` int NOT NULL AUTO_INCREMENT, `folio` varchar(255) NOT NULL, `isAviable` tinyint NOT NULL DEFAULT 1, `purchase` int NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `redeemAt` datetime NULL, `expirationDate` datetime NOT NULL, `clientName` varchar(255) NOT NULL, `alternate_users_id` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `alternate_Users` (`id` varchar(36) NOT NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `blackList` (`id` int NOT NULL AUTO_INCREMENT, `token` varchar(255) NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `instructors` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `lastname` varchar(255) NOT NULL, `description` text NOT NULL, `profilePicture` text NOT NULL, `largePicture` text NOT NULL, `isDeleted` tinyint NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `email` varchar(255) NULL, `password` varchar(255) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `locations` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `address` text NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `seats` (`id` int NOT NULL AUTO_INCREMENT, `number` varchar(255) NOT NULL, `rooms_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `rooms` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `description` text NOT NULL, `locations_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `schedules` (`id` int NOT NULL AUTO_INCREMENT, `date` datetime NOT NULL, `end` time NOT NULL, `start` time NOT NULL, `instructors_id` int NULL, `roomsId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `bundles` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `price` float NOT NULL, `offer` float NOT NULL, `description` varchar(255) NOT NULL, `classNumber` int NOT NULL, `expirationDays` int NOT NULL, `passes` int NOT NULL, `isDeleted` tinyint NOT NULL, `isRecurrent` tinyint NOT NULL, `isUnlimited` tinyint NOT NULL DEFAULT 0, `isEspecial` tinyint NOT NULL DEFAULT 0, `especialDescription` varchar(255) NULL, `promotionExpirationDays` int NULL, `pictureUrl` varchar(255) NULL, `altermateUserId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `transactions` (`id` varchar(36) NOT NULL, `voucher` varchar(255) NULL, `date` datetime NOT NULL, `invoice` tinyint NOT NULL, `total` float NOT NULL, `comments` text NULL, `purchases_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `payment_methods` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `type` enum ('efectivo', 'tarjeta') NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `purchases` (`id` int NOT NULL AUTO_INCREMENT, `date` datetime NOT NULL, `addedClasses` int NOT NULL DEFAULT 0, `addedPasses` int NOT NULL DEFAULT 0, `isCanceled` tinyint NOT NULL DEFAULT 0, `expirationDate` datetime NULL DEFAULT '1990-01-01 00:00:00', `bundles_id` int NULL, `payment_metods_id` int NULL, `users_id` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `users` (`id` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `lastname` varchar(255) NULL, `password` varchar(255) NULL, `pictureUrl` text NULL, `facebookId` varchar(255) NULL, `googleId` varchar(255) NULL, `tempToken` varchar(255) NULL, `isAdmin` tinyint NOT NULL DEFAULT 0, `isDeleted` tinyint NOT NULL DEFAULT 0, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `bookings` (`id` int NOT NULL AUTO_INCREMENT, `isPass` tinyint NOT NULL DEFAULT 0, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `fromPurchase` int NULL, `schedules_id` int NULL, `seats_id` int NULL, `user_id` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `discounts` (`id` int NOT NULL AUTO_INCREMENT, `description` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `versions` (`id` int NOT NULL AUTO_INCREMENT, `version` int NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `folios` ADD CONSTRAINT `FK_eef86d0781caf0af53c7b36bc17` FOREIGN KEY (`alternate_users_id`) REFERENCES `alternate_Users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `seats` ADD CONSTRAINT `FK_fb50bf5e21a79337fa688489cf9` FOREIGN KEY (`rooms_id`) REFERENCES `rooms`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `rooms` ADD CONSTRAINT `FK_0178c51847d16edcc783f2f2190` FOREIGN KEY (`locations_id`) REFERENCES `locations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `schedules` ADD CONSTRAINT `FK_6d282c3c17477bc4372d112fb55` FOREIGN KEY (`instructors_id`) REFERENCES `instructors`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `schedules` ADD CONSTRAINT `FK_18b6669d41a00bcec0a1ac9cd18` FOREIGN KEY (`roomsId`) REFERENCES `rooms`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `transactions` ADD CONSTRAINT `FK_ff9c524856f36515985a8015cb8` FOREIGN KEY (`purchases_id`) REFERENCES `purchases`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `purchases` ADD CONSTRAINT `FK_55c02fe57a6390a2a922a502439` FOREIGN KEY (`bundles_id`) REFERENCES `bundles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `purchases` ADD CONSTRAINT `FK_bd94b6931ce72cce6cc3bed2605` FOREIGN KEY (`payment_metods_id`) REFERENCES `payment_methods`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `purchases` ADD CONSTRAINT `FK_0ffd5cad11314f31a377e0a060c` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `bookings` ADD CONSTRAINT `FK_b520d11ac6fd38ae4bcbaedf576` FOREIGN KEY (`schedules_id`) REFERENCES `schedules`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `bookings` ADD CONSTRAINT `FK_295d6175faf90cbd3e0060f8eb5` FOREIGN KEY (`seats_id`) REFERENCES `seats`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `bookings` ADD CONSTRAINT `FK_64cd97487c5c42806458ab5520c` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `bookings` DROP FOREIGN KEY `FK_64cd97487c5c42806458ab5520c`");
        await queryRunner.query("ALTER TABLE `bookings` DROP FOREIGN KEY `FK_295d6175faf90cbd3e0060f8eb5`");
        await queryRunner.query("ALTER TABLE `bookings` DROP FOREIGN KEY `FK_b520d11ac6fd38ae4bcbaedf576`");
        await queryRunner.query("ALTER TABLE `purchases` DROP FOREIGN KEY `FK_0ffd5cad11314f31a377e0a060c`");
        await queryRunner.query("ALTER TABLE `purchases` DROP FOREIGN KEY `FK_bd94b6931ce72cce6cc3bed2605`");
        await queryRunner.query("ALTER TABLE `purchases` DROP FOREIGN KEY `FK_55c02fe57a6390a2a922a502439`");
        await queryRunner.query("ALTER TABLE `transactions` DROP FOREIGN KEY `FK_ff9c524856f36515985a8015cb8`");
        await queryRunner.query("ALTER TABLE `schedules` DROP FOREIGN KEY `FK_18b6669d41a00bcec0a1ac9cd18`");
        await queryRunner.query("ALTER TABLE `schedules` DROP FOREIGN KEY `FK_6d282c3c17477bc4372d112fb55`");
        await queryRunner.query("ALTER TABLE `rooms` DROP FOREIGN KEY `FK_0178c51847d16edcc783f2f2190`");
        await queryRunner.query("ALTER TABLE `seats` DROP FOREIGN KEY `FK_fb50bf5e21a79337fa688489cf9`");
        await queryRunner.query("ALTER TABLE `folios` DROP FOREIGN KEY `FK_eef86d0781caf0af53c7b36bc17`");
        await queryRunner.query("DROP TABLE `versions`");
        await queryRunner.query("DROP TABLE `discounts`");
        await queryRunner.query("DROP TABLE `bookings`");
        await queryRunner.query("DROP TABLE `users`");
        await queryRunner.query("DROP TABLE `purchases`");
        await queryRunner.query("DROP TABLE `payment_methods`");
        await queryRunner.query("DROP TABLE `transactions`");
        await queryRunner.query("DROP TABLE `bundles`");
        await queryRunner.query("DROP TABLE `schedules`");
        await queryRunner.query("DROP TABLE `rooms`");
        await queryRunner.query("DROP TABLE `seats`");
        await queryRunner.query("DROP TABLE `locations`");
        await queryRunner.query("DROP TABLE `instructors`");
        await queryRunner.query("DROP TABLE `blackList`");
        await queryRunner.query("DROP TABLE `alternate_Users`");
        await queryRunner.query("DROP TABLE `folios`");
    }

}
