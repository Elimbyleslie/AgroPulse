/*
  Warnings:

  - You are about to drop the `feedsupplier` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `feedpurchase` DROP FOREIGN KEY `FeedPurchase_supplierId_fkey`;

-- DropIndex
DROP INDEX `FeedPurchase_supplierId_fkey` ON `feedpurchase`;

-- DropTable
DROP TABLE `feedsupplier`;

-- CreateTable
CREATE TABLE `Supplier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` ENUM('FEED', 'MEDICAL', 'EQUIPMENT', 'SERVICE', 'OTHER') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedPurchase` ADD CONSTRAINT `FeedPurchase_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
