/*
  Warnings:

  - You are about to alter the column `price` on the `another_fees` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `total` on the `expense_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `total` on the `expenses` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `total` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `change` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `balance` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `price` on the `product_skus` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `buy_price` on the `product_skus` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `stock_quantity` on the `product_skus` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `discount_value` on the `promotion_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `min_qty` on the `promotion_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `discount_value` on the `promotion_transactions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `quantity` on the `purchase_stock_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `total` on the `purchase_stock_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `total` on the `purchase_stocks` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `omset` on the `reports` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `expenses` on the `reports` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `sales` on the `reports` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `profit` on the `reports` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `tax_value` on the `reports` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `tax_total` on the `reports` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `quantity` on the `stock_adjustment_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to drop the column `total` on the `stock_adjustments` table. All the data in the column will be lost.
  - You are about to alter the column `prev_quantity` on the `stock_movements` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `quantity` on the `stock_movements` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `current_quantity` on the `stock_movements` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `quantity` on the `stock_product_skus` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `quantity` on the `transaction_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `price` on the `transaction_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `subtotal` on the `transaction_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `discount_value` on the `transaction_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `discount_total` on the `transaction_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `total` on the `transaction_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `discount_value` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `discount_total` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `price_total` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `another_total` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - You are about to alter the column `grand_total` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Int`.
  - Added the required column `updated_at` to the `another_fees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `expense_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `payment_methods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `product_sku_images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `product_skus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `promotion_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `promotion_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `promotions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `purchase_stock_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `purchase_stocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `stock_adjustment_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `stock_adjustments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `stock_locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `stock_movements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `stock_product_skus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `transaction_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `another_fees` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `price` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `customers` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `expense_items` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `total` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `expenses` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `total` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `payment_methods` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `payments` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `total` INTEGER NOT NULL,
    MODIFY `change` INTEGER NOT NULL,
    MODIFY `balance` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `product_sku_images` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `product_skus` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `price` INTEGER NOT NULL,
    MODIFY `buy_price` INTEGER NOT NULL,
    MODIFY `stock_quantity` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `promotion_items` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `discount_value` DOUBLE NOT NULL,
    MODIFY `min_qty` DOUBLE NULL;

-- AlterTable
ALTER TABLE `promotion_transactions` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `discount_value` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `promotions` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `purchase_stock_items` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `quantity` DOUBLE NOT NULL,
    MODIFY `total` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `purchase_stocks` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `total` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `reports` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `omset` INTEGER NOT NULL,
    MODIFY `expenses` INTEGER NOT NULL,
    MODIFY `sales` INTEGER NOT NULL,
    MODIFY `profit` INTEGER NOT NULL,
    MODIFY `tax_value` DOUBLE NOT NULL,
    MODIFY `tax_total` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `settings` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `stock_adjustment_items` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `quantity` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `stock_adjustments` DROP COLUMN `total`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `stock_locations` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `stock_movements` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `prev_quantity` DOUBLE NOT NULL,
    MODIFY `quantity` DOUBLE NOT NULL,
    MODIFY `current_quantity` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `stock_product_skus` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `quantity` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `transaction_items` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `quantity` DOUBLE NOT NULL,
    MODIFY `price` INTEGER NOT NULL,
    MODIFY `subtotal` INTEGER NOT NULL,
    MODIFY `discount_value` DOUBLE NULL,
    MODIFY `discount_total` INTEGER NOT NULL,
    MODIFY `total` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `discount_value` DOUBLE NULL,
    MODIFY `discount_total` INTEGER NOT NULL,
    MODIFY `price_total` INTEGER NOT NULL,
    MODIFY `another_total` INTEGER NOT NULL,
    MODIFY `grand_total` INTEGER NOT NULL;
