/*
  Warnings:

  - You are about to drop the column `inventoryId` on the `feedingplan` table. All the data in the column will be lost.
  - The values [FEED] on the enum `inventory_category` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `feedingplan` DROP FOREIGN KEY `FeedingPlan_inventoryId_fkey`;

-- DropIndex
DROP INDEX `FeedingPlan_inventoryId_fkey` ON `feedingplan`;

-- AlterTable
ALTER TABLE `feedingplan` DROP COLUMN `inventoryId`;

-- AlterTable
ALTER TABLE `inventory` MODIFY `category` ENUM('MEDICINE', 'SUPPLEMENT', 'FERTILIZER', 'SEED', 'EQUIPMENT', 'TOOL', 'CHEMICAL', 'PACKAGING', 'FUEL', 'OTHER') NOT NULL;

-- AlterTable
ALTER TABLE `purchases` ADD COLUMN `itemName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `supplier` ADD COLUMN `farmId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `organizationId` INTEGER NULL,
    `farmId` INTEGER NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'XOF',
    `language` VARCHAR(191) NOT NULL DEFAULT 'fr',
    `dateFormat` VARCHAR(191) NOT NULL DEFAULT 'DD/MM/YYYY',
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Africa/Dakar',
    `weightUnit` VARCHAR(191) NOT NULL DEFAULT 'kg',
    `volumeUnit` VARCHAR(191) NOT NULL DEFAULT 'L',
    `areaUnit` VARCHAR(191) NOT NULL DEFAULT 'ha',
    `defaultSpeciesId` INTEGER NULL,
    `defaultBreedId` INTEGER NULL,
    `heatDetectionDays` INTEGER NOT NULL DEFAULT 21,
    `gestationDuration` INTEGER NOT NULL DEFAULT 280,
    `enableEmailAlerts` BOOLEAN NOT NULL DEFAULT true,
    `enableSmsAlerts` BOOLEAN NOT NULL DEFAULT false,
    `lowStockThreshold` DECIMAL(12, 2) NOT NULL DEFAULT 10,
    `taxRate` DOUBLE NULL DEFAULT 0,
    `defaultPaymentMethod` ENUM('card', 'mobile_money', 'orange_money', 'paypal', 'cash', 'others') NOT NULL DEFAULT 'cash',
    `primaryColor` VARCHAR(191) NULL DEFAULT '#1e40af',
    `logoUrl` VARCHAR(191) NULL,
    `farmName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Settings_farmId_key`(`farmId`),
    UNIQUE INDEX `Settings_organizationId_farmId_key`(`organizationId`, `farmId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Settings` ADD CONSTRAINT `Settings_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Settings` ADD CONSTRAINT `Settings_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
