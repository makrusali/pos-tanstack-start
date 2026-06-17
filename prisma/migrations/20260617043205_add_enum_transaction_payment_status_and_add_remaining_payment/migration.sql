-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `remaining_payment` INTEGER NOT NULL DEFAULT 0,
    MODIFY `payment_status` ENUM('paid', 'unpaid', 'partial') NOT NULL;
