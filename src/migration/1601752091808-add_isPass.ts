import {MigrationInterface, QueryRunner} from "typeorm";

export class addIsPass1601752091808 implements MigrationInterface {
    name = 'addIsPass1601752091808'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `seats` DROP FOREIGN KEY `FK_fb50bf5e21a79337fa688489cf9`");
        await queryRunner.query("ALTER TABLE `seats` CHANGE `rooms_id` `rooms_id` int NULL");
        await queryRunner.query("ALTER TABLE `rooms` DROP FOREIGN KEY `FK_0178c51847d16edcc783f2f2190`");
        await queryRunner.query("ALTER TABLE `rooms` CHANGE `locations_id` `locations_id` int NULL");
        await queryRunner.query("ALTER TABLE `schedules` DROP FOREIGN KEY `FK_6d282c3c17477bc4372d112fb55`");
        await queryRunner.query("ALTER TABLE `schedules` DROP FOREIGN KEY `FK_18b6669d41a00bcec0a1ac9cd18`");
        await queryRunner.query("ALTER TABLE `schedules` CHANGE `instructors_id` `instructors_id` int NULL");
        await queryRunner.query("ALTER TABLE `schedules` CHANGE `roomsId` `roomsId` int NULL");
        await queryRunner.query("ALTER TABLE `bundles` CHANGE `price` `price` float NOT NULL");
        await queryRunner.query("ALTER TABLE `bundles` CHANGE `offer` `offer` float NOT NULL");
        await queryRunner.query("ALTER TABLE `transactions` DROP FOREIGN KEY `FK_ff9c524856f36515985a8015cb8`");
        await queryRunner.query("ALTER TABLE `transactions` CHANGE `voucher` `voucher` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `transactions` CHANGE `total` `total` float NOT NULL");
        await queryRunner.query("ALTER TABLE `transactions` CHANGE `purchases_id` `purchases_id` int NULL");
        await queryRunner.query("ALTER TABLE `purchases` DROP FOREIGN KEY `FK_55c02fe57a6390a2a922a502439`");
        await queryRunner.query("ALTER TABLE `purchases` DROP FOREIGN KEY `FK_bd94b6931ce72cce6cc3bed2605`");
        await queryRunner.query("ALTER TABLE `purchases` DROP FOREIGN KEY `FK_0ffd5cad11314f31a377e0a060c`");
        await queryRunner.query("ALTER TABLE `purchases` CHANGE `bundles_id` `bundles_id` int NULL");
        await queryRunner.query("ALTER TABLE `purchases` CHANGE `payment_metods_id` `payment_metods_id` int NULL");
        await queryRunner.query("ALTER TABLE `purchases` CHANGE `users_id` `users_id` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `lastname` `lastname` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `password` `password` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `pictureUrl` `pictureUrl` text NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `facebookId` `facebookId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `googleId` `googleId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `tempToken` `tempToken` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `bookings` DROP FOREIGN KEY `FK_b520d11ac6fd38ae4bcbaedf576`");
        await queryRunner.query("ALTER TABLE `bookings` DROP FOREIGN KEY `FK_295d6175faf90cbd3e0060f8eb5`");
        await queryRunner.query("ALTER TABLE `bookings` DROP FOREIGN KEY `FK_64cd97487c5c42806458ab5520c`");
        await queryRunner.query("ALTER TABLE `bookings` CHANGE `schedules_id` `schedules_id` int NULL");
        await queryRunner.query("ALTER TABLE `bookings` CHANGE `seats_id` `seats_id` int NULL");
        await queryRunner.query("ALTER TABLE `bookings` CHANGE `user_id` `user_id` varchar(36) NULL");
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
        await queryRunner.query("ALTER TABLE `bookings` CHANGE `user_id` `user_id` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `bookings` CHANGE `seats_id` `seats_id` int NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `bookings` CHANGE `schedules_id` `schedules_id` int NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `bookings` ADD CONSTRAINT `FK_64cd97487c5c42806458ab5520c` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `bookings` ADD CONSTRAINT `FK_295d6175faf90cbd3e0060f8eb5` FOREIGN KEY (`seats_id`) REFERENCES `seats`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `bookings` ADD CONSTRAINT `FK_b520d11ac6fd38ae4bcbaedf576` FOREIGN KEY (`schedules_id`) REFERENCES `schedules`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `users` CHANGE `tempToken` `tempToken` varchar(255) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `googleId` `googleId` varchar(255) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `facebookId` `facebookId` varchar(255) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `pictureUrl` `pictureUrl` text NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `password` `password` varchar(255) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `users` CHANGE `lastname` `lastname` varchar(255) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `purchases` CHANGE `users_id` `users_id` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `purchases` CHANGE `payment_metods_id` `payment_metods_id` int NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `purchases` CHANGE `bundles_id` `bundles_id` int NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `purchases` ADD CONSTRAINT `FK_0ffd5cad11314f31a377e0a060c` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `purchases` ADD CONSTRAINT `FK_bd94b6931ce72cce6cc3bed2605` FOREIGN KEY (`payment_metods_id`) REFERENCES `payment_methods`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `purchases` ADD CONSTRAINT `FK_55c02fe57a6390a2a922a502439` FOREIGN KEY (`bundles_id`) REFERENCES `bundles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `transactions` CHANGE `purchases_id` `purchases_id` int NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `transactions` CHANGE `total` `total` float(12) NOT NULL");
        await queryRunner.query("ALTER TABLE `transactions` CHANGE `voucher` `voucher` varchar(255) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `transactions` ADD CONSTRAINT `FK_ff9c524856f36515985a8015cb8` FOREIGN KEY (`purchases_id`) REFERENCES `purchases`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `bundles` CHANGE `offer` `offer` float(12) NOT NULL");
        await queryRunner.query("ALTER TABLE `bundles` CHANGE `price` `price` float(12) NOT NULL");
        await queryRunner.query("ALTER TABLE `schedules` CHANGE `roomsId` `roomsId` int NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `schedules` CHANGE `instructors_id` `instructors_id` int NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `schedules` ADD CONSTRAINT `FK_18b6669d41a00bcec0a1ac9cd18` FOREIGN KEY (`roomsId`) REFERENCES `rooms`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `schedules` ADD CONSTRAINT `FK_6d282c3c17477bc4372d112fb55` FOREIGN KEY (`instructors_id`) REFERENCES `instructors`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `rooms` CHANGE `locations_id` `locations_id` int NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `rooms` ADD CONSTRAINT `FK_0178c51847d16edcc783f2f2190` FOREIGN KEY (`locations_id`) REFERENCES `locations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `seats` CHANGE `rooms_id` `rooms_id` int NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `seats` ADD CONSTRAINT `FK_fb50bf5e21a79337fa688489cf9` FOREIGN KEY (`rooms_id`) REFERENCES `rooms`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}
