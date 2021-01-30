import {MigrationInterface, QueryRunner} from "typeorm";

export class init1611974249631 implements MigrationInterface {
    name = 'init1611974249631'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `folios` CHANGE `createdAt` `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `blackList` CHANGE `createdAt` `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `bundles` CHANGE `price` `price` float NOT NULL");
        await queryRunner.query("ALTER TABLE `bundles` CHANGE `offer` `offer` float NOT NULL");
        await queryRunner.query("ALTER TABLE `transactions` CHANGE `total` `total` float NOT NULL");
        await queryRunner.query("ALTER TABLE `users` CHANGE `createdAt` `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `instructors` CHANGE `createdAt` `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `bookings` CHANGE `createdAt` `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `versions` CHANGE `createdAt` `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `versions` CHANGE `createdAt` `createdAt` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `bookings` CHANGE `createdAt` `createdAt` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `instructors` CHANGE `createdAt` `createdAt` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `users` CHANGE `createdAt` `createdAt` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `transactions` CHANGE `total` `total` float NOT NULL");
        await queryRunner.query("ALTER TABLE `bundles` CHANGE `offer` `offer` float NOT NULL");
        await queryRunner.query("ALTER TABLE `bundles` CHANGE `price` `price` float NOT NULL");
        await queryRunner.query("ALTER TABLE `blackList` CHANGE `createdAt` `createdAt` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `folios` CHANGE `createdAt` `createdAt` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP");
    }

}
