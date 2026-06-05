/*
  Warnings:

  - Added the required column `payment_method_id` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payments` ADD COLUMN `payment_method_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
