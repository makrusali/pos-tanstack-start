-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `avatar_url` VARCHAR(255) NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `id` VARCHAR(191) NOT NULL,
    `module` VARCHAR(255) NOT NULL,
    `action` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoleHasPermission` (
    `role_id` VARCHAR(191) NOT NULL,
    `permission_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Unit` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('integer', 'decimal') NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` ENUM('item', 'service') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductCategory` (
    `category_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`category_id`, `product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductSku` (
    `id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NULL,
    `price` DECIMAL(15, 2) NOT NULL,
    `buy_price` DECIMAL(15, 2) NOT NULL,
    `stock_quantity` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductSkuImage` (
    `id` VARCHAR(191) NOT NULL,
    `product_sku_id` VARCHAR(191) NOT NULL,
    `path` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockLocation` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `note` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL,

    UNIQUE INDEX `StockLocation_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockProductSku` (
    `id` VARCHAR(191) NOT NULL,
    `product_sku_id` VARCHAR(191) NOT NULL,
    `stock_location_id` VARCHAR(191) NOT NULL,
    `is_primary` BOOLEAN NOT NULL,
    `quantity` DECIMAL(15, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Promotion` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromotionTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `promotion_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `discount_value` DECIMAL(15, 2) NOT NULL,
    `discount_type` ENUM('percent', 'fixed') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromotionItem` (
    `id` VARCHAR(191) NOT NULL,
    `promotion_id` VARCHAR(191) NOT NULL,
    `product_sku_id` VARCHAR(191) NOT NULL,
    `discount_value` DECIMAL(15, 2) NOT NULL,
    `discount_type` ENUM('percent', 'fixed') NOT NULL,
    `min_qty` DECIMAL(15, 2) NULL,
    `is_multiple_allowed` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `address` VARCHAR(191) NULL,
    `contact` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('draft', 'done', 'cancelled') NOT NULL,
    `customer_id` VARCHAR(191) NULL,
    `promotion_id` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `discount_value` DECIMAL(15, 2) NULL,
    `discount_type` ENUM('percent', 'fixed') NULL,
    `discount_id` VARCHAR(191) NULL,
    `discount_total` DECIMAL(15, 2) NOT NULL,
    `price_total` DECIMAL(15, 2) NOT NULL,
    `another_total` DECIMAL(15, 2) NOT NULL,
    `grand_total` DECIMAL(15, 2) NOT NULL,
    `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentMethod` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL,
    `image_path` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `status` ENUM('paid', 'unpaid') NOT NULL,
    `total` DECIMAL(15, 2) NOT NULL,
    `change` DECIMAL(15, 2) NOT NULL,
    `balance` DECIMAL(15, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransactionItem` (
    `id` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `product_sku_id` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(15, 2) NOT NULL,
    `price` DECIMAL(15, 2) NOT NULL,
    `subtotal` DECIMAL(15, 2) NOT NULL,
    `discount_value` DECIMAL(15, 2) NULL,
    `discount_type` ENUM('percent', 'fixed') NULL,
    `discount_id` VARCHAR(191) NULL,
    `discount_total` DECIMAL(15, 2) NOT NULL,
    `total` DECIMAL(15, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnotherFee` (
    `id` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `price` DECIMAL(15, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockMovement` (
    `id` VARCHAR(191) NOT NULL,
    `reference_type` VARCHAR(255) NOT NULL,
    `reference_id` VARCHAR(255) NOT NULL,
    `stock_product_sku_id` VARCHAR(191) NOT NULL,
    `prev_quantity` DECIMAL(15, 2) NOT NULL,
    `quantity` DECIMAL(15, 2) NOT NULL,
    `current_quantity` DECIMAL(15, 2) NOT NULL,
    `type` ENUM('in', 'out') NOT NULL,
    `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `note` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseStock` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('draft', 'pending', 'done', 'cancelled') NOT NULL,
    `supplier_name` VARCHAR(255) NOT NULL,
    `note` VARCHAR(191) NULL,
    `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total` DECIMAL(15, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseStockItem` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'received', 'refunded') NOT NULL,
    `purchase_stock_id` VARCHAR(191) NOT NULL,
    `product_sku_id` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(15, 2) NOT NULL,
    `total` DECIMAL(15, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockAdjustment` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('draft', 'done', 'cancelled') NOT NULL,
    `note` VARCHAR(191) NULL,
    `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total` DECIMAL(15, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockAdjustmentItem` (
    `id` VARCHAR(191) NOT NULL,
    `stock_adjusment_id` VARCHAR(191) NOT NULL,
    `product_sku_id` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(15, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Expense` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('draft', 'done', 'cancelled') NOT NULL,
    `note` VARCHAR(191) NULL,
    `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total` DECIMAL(15, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExpenseItem` (
    `id` VARCHAR(191) NOT NULL,
    `expense_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `total` DECIMAL(15, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `omset` DECIMAL(15, 2) NOT NULL,
    `expenses` DECIMAL(15, 2) NOT NULL,
    `sales` DECIMAL(15, 2) NOT NULL,
    `profit` DECIMAL(15, 2) NOT NULL,
    `tax_type` ENUM('fixed', 'percent') NOT NULL,
    `tax_value` DECIMAL(15, 2) NOT NULL,
    `tax_total` DECIMAL(15, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `id` VARCHAR(191) NOT NULL,
    `store_name` VARCHAR(255) NOT NULL,
    `store_phone` VARCHAR(255) NOT NULL,
    `store_email` VARCHAR(255) NOT NULL,
    `store_description` VARCHAR(191) NULL,
    `store_address` VARCHAR(191) NULL,
    `stock_guard` ENUM('active', 'inactive') NOT NULL,
    `receipent_thanks_text` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleHasPermission` ADD CONSTRAINT `RoleHasPermission_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleHasPermission` ADD CONSTRAINT `RoleHasPermission_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `Permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductCategory` ADD CONSTRAINT `ProductCategory_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductCategory` ADD CONSTRAINT `ProductCategory_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSku` ADD CONSTRAINT `ProductSku_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSku` ADD CONSTRAINT `ProductSku_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `Unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSkuImage` ADD CONSTRAINT `ProductSkuImage_product_sku_id_fkey` FOREIGN KEY (`product_sku_id`) REFERENCES `ProductSku`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockProductSku` ADD CONSTRAINT `StockProductSku_product_sku_id_fkey` FOREIGN KEY (`product_sku_id`) REFERENCES `ProductSku`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockProductSku` ADD CONSTRAINT `StockProductSku_stock_location_id_fkey` FOREIGN KEY (`stock_location_id`) REFERENCES `StockLocation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromotionTransaction` ADD CONSTRAINT `PromotionTransaction_promotion_id_fkey` FOREIGN KEY (`promotion_id`) REFERENCES `Promotion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromotionItem` ADD CONSTRAINT `PromotionItem_promotion_id_fkey` FOREIGN KEY (`promotion_id`) REFERENCES `Promotion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromotionItem` ADD CONSTRAINT `PromotionItem_product_sku_id_fkey` FOREIGN KEY (`product_sku_id`) REFERENCES `ProductSku`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_promotion_id_fkey` FOREIGN KEY (`promotion_id`) REFERENCES `Promotion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_discount_id_fkey` FOREIGN KEY (`discount_id`) REFERENCES `PromotionTransaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `Transaction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionItem` ADD CONSTRAINT `TransactionItem_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `Transaction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionItem` ADD CONSTRAINT `TransactionItem_product_sku_id_fkey` FOREIGN KEY (`product_sku_id`) REFERENCES `ProductSku`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionItem` ADD CONSTRAINT `TransactionItem_discount_id_fkey` FOREIGN KEY (`discount_id`) REFERENCES `PromotionItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnotherFee` ADD CONSTRAINT `AnotherFee_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `Transaction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_stock_product_sku_id_fkey` FOREIGN KEY (`stock_product_sku_id`) REFERENCES `StockProductSku`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseStockItem` ADD CONSTRAINT `PurchaseStockItem_purchase_stock_id_fkey` FOREIGN KEY (`purchase_stock_id`) REFERENCES `PurchaseStock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseStockItem` ADD CONSTRAINT `PurchaseStockItem_product_sku_id_fkey` FOREIGN KEY (`product_sku_id`) REFERENCES `ProductSku`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockAdjustmentItem` ADD CONSTRAINT `StockAdjustmentItem_stock_adjusment_id_fkey` FOREIGN KEY (`stock_adjusment_id`) REFERENCES `StockAdjustment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockAdjustmentItem` ADD CONSTRAINT `StockAdjustmentItem_product_sku_id_fkey` FOREIGN KEY (`product_sku_id`) REFERENCES `ProductSku`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExpenseItem` ADD CONSTRAINT `ExpenseItem_expense_id_fkey` FOREIGN KEY (`expense_id`) REFERENCES `Expense`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
