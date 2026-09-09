/*
  Warnings:

  - You are about to drop the `saleitem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `saleitem` DROP FOREIGN KEY `SaleItem_animalId_fkey`;

-- DropForeignKey
ALTER TABLE `saleitem` DROP FOREIGN KEY `SaleItem_lotId_fkey`;

-- DropForeignKey
ALTER TABLE `saleitem` DROP FOREIGN KEY `SaleItem_productionId_fkey`;

-- DropForeignKey
ALTER TABLE `saleitem` DROP FOREIGN KEY `SaleItem_saleId_fkey`;

-- DropTable
DROP TABLE `saleitem`;

-- CreateTable
CREATE TABLE `sale_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saleId` INTEGER NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `category` ENUM('Product', 'byproduct') NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `productionId` INTEGER NULL,
    `lotId` INTEGER NULL,
    `animalId` INTEGER NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `sale_items_saleId_idx`(`saleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sale_items` ADD CONSTRAINT `sale_items_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `Sale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_items` ADD CONSTRAINT `sale_items_productionId_fkey` FOREIGN KEY (`productionId`) REFERENCES `Production`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_items` ADD CONSTRAINT `sale_items_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `Lot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_items` ADD CONSTRAINT `sale_items_animalId_fkey` FOREIGN KEY (`animalId`) REFERENCES `Animal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
