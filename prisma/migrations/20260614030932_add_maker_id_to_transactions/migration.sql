/*
  Warnings:

  - You are about to drop the column `stockLocationId` on the `stock_batches` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `stock_batches` DROP FOREIGN KEY `stock_batches_stockLocationId_fkey`;

-- DropForeignKey
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_supplierId_fkey`;

-- DropIndex
DROP INDEX `stock_batches_stockLocationId_fkey` ON `stock_batches`;

-- DropIndex
DROP INDEX `transactions_supplierId_fkey` ON `transactions`;

-- AlterTable
ALTER TABLE `stock_batches` DROP COLUMN `stockLocationId`,
    ADD COLUMN `stock_location_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `transactions` DROP COLUMN `supplierId`,
    ADD COLUMN `maker_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `stock_batches` ADD CONSTRAINT `stock_batches_stock_location_id_fkey` FOREIGN KEY (`stock_location_id`) REFERENCES `stock_locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_maker_id_fkey` FOREIGN KEY (`maker_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
