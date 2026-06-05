/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `product_skus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `product_skus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product_skus` ADD COLUMN `code` VARCHAR(12) NOT NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `is_variant` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `product_skus_code_key` ON `product_skus`(`code`);
