-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `avatar_url` VARCHAR(255) NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_id_fkey`(`role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` VARCHAR(191) NOT NULL,
    `module` VARCHAR(255) NOT NULL,
    `action` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_has_permissions` (
    `role_id` VARCHAR(191) NOT NULL,
    `permission_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `role_has_permissions_permission_id_fkey`(`permission_id`),
    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `units` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('integer', 'decimal') NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` ENUM('item', 'service') NOT NULL,
    `is_variant` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_categories` (
    `category_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `product_categories_product_id_fkey`(`product_id`),
    PRIMARY KEY (`category_id`, `product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_skus` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(12) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NULL,
    `price` INTEGER NOT NULL,
    `buy_price` INTEGER NOT NULL,
    `stock_quantity` DECIMAL(10, 4) NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `product_skus_code_key`(`code`),
    INDEX `product_skus_product_id_fkey`(`product_id`),
    INDEX `product_skus_unit_id_fkey`(`unit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_sku_images` (
    `id` VARCHAR(191) NOT NULL,
    `product_sku_id` VARCHAR(191) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `product_sku_images_product_sku_id_fkey`(`product_sku_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_locations` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `note` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `stock_locations_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_product_skus` (
    `id` VARCHAR(191) NOT NULL,
    `product_sku_id` VARCHAR(191) NOT NULL,
    `stock_location_id` VARCHAR(191) NOT NULL,
    `is_primary` BOOLEAN NOT NULL,
    `quantity` DECIMAL(10, 4) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `stock_product_skus_product_sku_id_fkey`(`product_sku_id`),
    INDEX `stock_product_skus_stock_location_id_fkey`(`stock_location_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotion_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `promotion_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `discount_value` DOUBLE NOT NULL,
    `discount_type` ENUM('percent', 'fixed') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `promotion_transactions_promotion_id_fkey`(`promotion_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotion_items` (
    `id` VARCHAR(191) NOT NULL,
    `promotion_id` VARCHAR(191) NOT NULL,
    `product_sku_id` VARCHAR(191) NOT NULL,
    `discount_value` DOUBLE NOT NULL,
    `discount_type` ENUM('percent', 'fixed') NOT NULL,
    `min_qty` DOUBLE NULL,
    `is_multiple_allowed` BOOLEAN NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `promotion_items_product_sku_id_fkey`(`product_sku_id`),
    INDEX `promotion_items_promotion_id_fkey`(`promotion_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `address` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `address` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('draft', 'done', 'cancelled') NOT NULL,
    `customer_id` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `promotion_id` VARCHAR(191) NULL,
    `transaction_discount_id` VARCHAR(191) NULL,
    `transaction_discount_type` ENUM('percent', 'fixed') NULL,
    `transaction_discount_value` DOUBLE NULL,
    `transaction_discount_amount` INTEGER NOT NULL,
    `items_discount_amount` INTEGER NOT NULL,
    `discount_total` INTEGER NOT NULL,
    `price_total` INTEGER NOT NULL,
    `other_cost_total` INTEGER NOT NULL,
    `grand_total` INTEGER NOT NULL,
    `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `supplierId` VARCHAR(191) NULL,

    INDEX `transactions_customer_id_fkey`(`customer_id`),
    INDEX `transactions_promotion_id_fkey`(`promotion_id`),
    INDEX `transactions_supplierId_fkey`(`supplierId`),
    INDEX `transactions_transaction_discount_id_fkey`(`transaction_discount_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_methods` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL,
    `image_path` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `payment_method_id` VARCHAR(191) NOT NULL,
    `status` ENUM('paid', 'unpaid') NOT NULL,
    `total` INTEGER NOT NULL,
    `change` INTEGER NOT NULL,
    `balance` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `payments_payment_method_id_fkey`(`payment_method_id`),
    INDEX `payments_transaction_id_fkey`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_items` (
    `id` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `product_sku_id` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(10, 4) NOT NULL,
    `buy_price` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `discounted_price` INTEGER NOT NULL,
    `subtotal` INTEGER NOT NULL,
    `discount_id` VARCHAR(191) NULL,
    `discount_value` DOUBLE NULL,
    `discount_type` ENUM('percent', 'fixed') NULL,
    `discount_amount` INTEGER NOT NULL,
    `discount_total` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `transaction_items_discount_id_fkey`(`discount_id`),
    INDEX `transaction_items_product_sku_id_fkey`(`product_sku_id`),
    INDEX `transaction_items_transaction_id_fkey`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `another_fees` (
    `id` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `price` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `another_fees_transaction_id_fkey`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_movements` (
    `id` VARCHAR(191) NOT NULL,
    `reference_type` VARCHAR(255) NOT NULL,
    `reference_id` VARCHAR(255) NOT NULL,
    `stock_product_sku_id` VARCHAR(191) NOT NULL,
    `buy_price` INTEGER NOT NULL,
    `prev_quantity` DECIMAL(10, 4) NOT NULL,
    `quantity` DECIMAL(10, 4) NOT NULL,
    `current_quantity` DECIMAL(10, 4) NOT NULL,
    `type` ENUM('in', 'out') NOT NULL,
    `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `stock_movements_stock_product_sku_id_fkey`(`stock_product_sku_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_stocks` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('draft', 'pending', 'done', 'cancelled') NOT NULL,
    `supplier_name` VARCHAR(255) NOT NULL,
    `note` VARCHAR(191) NULL,
    `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_stock_items` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'received', 'refunded') NOT NULL,
    `purchase_stock_id` VARCHAR(191) NOT NULL,
    `product_sku_id` VARCHAR(191) NOT NULL,
    `buy_price` INTEGER NOT NULL,
    `quantity` DECIMAL(10, 4) NOT NULL,
    `total` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `purchase_stock_items_product_sku_id_fkey`(`product_sku_id`),
    INDEX `purchase_stock_items_purchase_stock_id_fkey`(`purchase_stock_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_adjustments` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('draft', 'done', 'cancelled') NOT NULL,
    `note` VARCHAR(191) NULL,
    `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_adjustment_items` (
    `id` VARCHAR(191) NOT NULL,
    `stock_adjusment_id` VARCHAR(191) NOT NULL,
    `product_sku_id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `stock_adjustment_items_product_sku_id_fkey`(`product_sku_id`),
    INDEX `stock_adjustment_items_stock_adjusment_id_fkey`(`stock_adjusment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expenses` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('draft', 'done', 'cancelled') NOT NULL,
    `note` VARCHAR(191) NULL,
    `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expense_items` (
    `id` VARCHAR(191) NOT NULL,
    `expense_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `total` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `expense_items_expense_id_fkey`(`expense_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `omset` INTEGER NOT NULL,
    `expenses` INTEGER NOT NULL,
    `sales` INTEGER NOT NULL,
    `profit` INTEGER NOT NULL,
    `tax_type` ENUM('fixed', 'percent') NOT NULL,
    `tax_value` DOUBLE NOT NULL,
    `tax_total` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` VARCHAR(191) NOT NULL,
    `store_name` VARCHAR(255) NOT NULL,
    `store_phone` VARCHAR(255) NOT NULL,
    `store_email` VARCHAR(255) NOT NULL,
    `store_description` VARCHAR(191) NULL,
    `store_address` VARCHAR(191) NULL,
    `stock_guard` ENUM('active', 'inactive') NOT NULL,
    `receipent_thanks_text` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_has_permissions` ADD CONSTRAINT `role_has_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_has_permissions` ADD CONSTRAINT `role_has_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_skus` ADD CONSTRAINT `product_skus_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_skus` ADD CONSTRAINT `product_skus_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_sku_images` ADD CONSTRAINT `product_sku_images_product_sku_id_fkey` FOREIGN KEY (`product_sku_id`) REFERENCES `product_skus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_product_skus` ADD CONSTRAINT `stock_product_skus_product_sku_id_fkey` FOREIGN KEY (`product_sku_id`) REFERENCES `product_skus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_product_skus` ADD CONSTRAINT `stock_product_skus_stock_location_id_fkey` FOREIGN KEY (`stock_location_id`) REFERENCES `stock_locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_transactions` ADD CONSTRAINT `promotion_transactions_promotion_id_fkey` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_items` ADD CONSTRAINT `promotion_items_product_sku_id_fkey` FOREIGN KEY (`product_sku_id`) REFERENCES `product_skus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_items` ADD CONSTRAINT `promotion_items_promotion_id_fkey` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_promotion_id_fkey` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_transaction_discount_id_fkey` FOREIGN KEY (`transaction_discount_id`) REFERENCES `promotion_transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_discount_id_fkey` FOREIGN KEY (`discount_id`) REFERENCES `promotion_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_product_sku_id_fkey` FOREIGN KEY (`product_sku_id`) REFERENCES `product_skus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_items` ADD CONSTRAINT `transaction_items_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `another_fees` ADD CONSTRAINT `another_fees_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_stock_product_sku_id_fkey` FOREIGN KEY (`stock_product_sku_id`) REFERENCES `stock_product_skus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_stock_items` ADD CONSTRAINT `purchase_stock_items_product_sku_id_fkey` FOREIGN KEY (`product_sku_id`) REFERENCES `product_skus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_stock_items` ADD CONSTRAINT `purchase_stock_items_purchase_stock_id_fkey` FOREIGN KEY (`purchase_stock_id`) REFERENCES `purchase_stocks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_adjustment_items` ADD CONSTRAINT `stock_adjustment_items_product_sku_id_fkey` FOREIGN KEY (`product_sku_id`) REFERENCES `product_skus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_adjustment_items` ADD CONSTRAINT `stock_adjustment_items_stock_adjusment_id_fkey` FOREIGN KEY (`stock_adjusment_id`) REFERENCES `stock_adjustments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense_items` ADD CONSTRAINT `expense_items_expense_id_fkey` FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
