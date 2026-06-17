/*
  Warnings:

  - You are about to drop the column `stockBatchesId` on the `stock_movements` table. All the data in the column will be lost.
  - Made the column `maker_id` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `stock_movements` DROP FOREIGN KEY `stock_movements_stockBatchesId_fkey`;

-- DropForeignKey
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_maker_id_fkey`;

-- DropIndex
DROP INDEX `stock_movements_stockBatchesId_fkey` ON `stock_movements`;

-- DropIndex
DROP INDEX `transactions_maker_id_fkey` ON `transactions`;

-- AlterTable
ALTER TABLE `stock_movements` DROP COLUMN `stockBatchesId`,
    ADD COLUMN `stock_batches_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `transaction_items` ADD COLUMN `stock_batches_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `transactions` MODIFY `maker_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_maker_id_fkey` FOREIGN KEY (`maker_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_stock_batches_id_fkey` FOREIGN KEY (`stock_batches_id`) REFERENCES `stock_batches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_stock_batches_id_fkey` FOREIGN KEY (`stock_batches_id`) REFERENCES `stock_batches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
