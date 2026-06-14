/*
  Warnings:

  - You are about to drop the `another_fees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stockbatchusage` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `code` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_status` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_before_discount_total` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `another_fees` DROP FOREIGN KEY `another_fees_transaction_id_fkey`;

-- DropForeignKey
ALTER TABLE `stockbatchusage` DROP FOREIGN KEY `StockBatchUsage_stock_batches_id_fkey`;

-- AlterTable
ALTER TABLE `promotion_items` MODIFY `min_qty` DECIMAL(65, 30) NULL;

-- AlterTable
ALTER TABLE `transaction_items` ADD COLUMN `discount_is_multiple_allowed` BOOLEAN NULL,
    ADD COLUMN `discount_min_qty` DECIMAL(65, 30) NULL;

-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `code` VARCHAR(191) NOT NULL,
    ADD COLUMN `payment_status` ENUM('paid', 'unpaid') NOT NULL,
    ADD COLUMN `price_before_discount_total` INTEGER NOT NULL;

-- DropTable
DROP TABLE `another_fees`;

-- DropTable
DROP TABLE `stockbatchusage`;

-- CreateTable
CREATE TABLE `stock_batch_usages` (
    `id` VARCHAR(191) NOT NULL,
    `stock_batches_id` VARCHAR(191) NOT NULL,
    `prev_quantity` DECIMAL(10, 4) NOT NULL,
    `quantity` DECIMAL(10, 4) NOT NULL,
    `current_quantity` DECIMAL(10, 4) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `other_costs` (
    `id` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `price` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `other_costs_transaction_id_fkey`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stock_batch_usages` ADD CONSTRAINT `stock_batch_usages_stock_batches_id_fkey` FOREIGN KEY (`stock_batches_id`) REFERENCES `stock_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `other_costs` ADD CONSTRAINT `other_costs_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
