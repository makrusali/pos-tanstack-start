/*
  Warnings:

  - You are about to drop the column `buy_price` on the `stock_movements` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `stock_movements` DROP COLUMN `buy_price`,
    ADD COLUMN `stockBatchesId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `stock_batches` (
    `id` VARCHAR(191) NOT NULL,
    `product_sku_id` VARCHAR(191) NOT NULL,
    `stock_product_sku_id` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(10, 4) NOT NULL,
    `remaining_quantity` DECIMAL(10, 4) NOT NULL,
    `buy_price` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `source_reference` VARCHAR(191) NOT NULL,
    `source_id` VARCHAR(191) NOT NULL,
    `stockLocationId` VARCHAR(191) NULL,

    INDEX `stock_batches_product_sku_id_fkey`(`product_sku_id`),
    INDEX `stock_batches_stock_product_skus_id_fkey`(`stock_product_sku_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockBatchUsage` (
    `id` VARCHAR(191) NOT NULL,
    `stock_batches_id` VARCHAR(191) NOT NULL,
    `prev_quantity` DECIMAL(10, 4) NOT NULL,
    `quantity` DECIMAL(10, 4) NOT NULL,
    `current_quantity` DECIMAL(10, 4) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stock_batches` ADD CONSTRAINT `stock_batches_product_sku_id_fkey` FOREIGN KEY (`product_sku_id`) REFERENCES `product_skus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_batches` ADD CONSTRAINT `stock_batches_stock_product_sku_id_fkey` FOREIGN KEY (`stock_product_sku_id`) REFERENCES `stock_product_skus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_batches` ADD CONSTRAINT `stock_batches_stockLocationId_fkey` FOREIGN KEY (`stockLocationId`) REFERENCES `stock_locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockBatchUsage` ADD CONSTRAINT `StockBatchUsage_stock_batches_id_fkey` FOREIGN KEY (`stock_batches_id`) REFERENCES `stock_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_stockBatchesId_fkey` FOREIGN KEY (`stockBatchesId`) REFERENCES `stock_batches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
