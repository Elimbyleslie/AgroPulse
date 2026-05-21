/*
  Warnings:

  - Added the required column `unit` to the `AnimalFeeding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AnimalFeeding` table without a default value. This is not possible if the table is not empty.
  - Made the column `lotId` on table `animalfeeding` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `animalfeeding` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `FeedStock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `animalfeeding` DROP FOREIGN KEY `AnimalFeeding_animalId_fkey`;

-- DropForeignKey
ALTER TABLE `animalfeeding` DROP FOREIGN KEY `AnimalFeeding_feedStockId_fkey`;

-- DropForeignKey
ALTER TABLE `animalfeeding` DROP FOREIGN KEY `AnimalFeeding_lotId_fkey`;

-- DropForeignKey
ALTER TABLE `animalfeeding` DROP FOREIGN KEY `AnimalFeeding_userId_fkey`;

-- DropForeignKey
ALTER TABLE `feedstock` DROP FOREIGN KEY `FeedStock_farmId_fkey`;

-- DropForeignKey
ALTER TABLE `feedusage` DROP FOREIGN KEY `FeedUsage_feedStockId_fkey`;

-- DropForeignKey
ALTER TABLE `feedusage` DROP FOREIGN KEY `FeedUsage_lotId_fkey`;

-- DropIndex
DROP INDEX `AnimalFeeding_animalId_fkey` ON `animalfeeding`;

-- DropIndex
DROP INDEX `AnimalFeeding_feedStockId_fkey` ON `animalfeeding`;

-- DropIndex
DROP INDEX `AnimalFeeding_lotId_fkey` ON `animalfeeding`;

-- DropIndex
DROP INDEX `AnimalFeeding_userId_fkey` ON `animalfeeding`;

-- DropIndex
DROP INDEX `FeedStock_farmId_fkey` ON `feedstock`;

-- DropIndex
DROP INDEX `FeedUsage_feedStockId_fkey` ON `feedusage`;

-- DropIndex
DROP INDEX `FeedUsage_lotId_fkey` ON `feedusage`;

-- AlterTable
ALTER TABLE `animalfeeding` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `unit` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `lotId` INTEGER NOT NULL,
    MODIFY `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `feedpurchase` ADD COLUMN `feedStockId` INTEGER NULL;

-- AlterTable
ALTER TABLE `feedstock` ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `minQuantity` DOUBLE NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `feedusage` ADD COLUMN `animalFeedingId` INTEGER NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `FeedingPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `animalId` INTEGER NOT NULL,
    `feedStockId` INTEGER NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `frequency` ENUM('daily', 'weekly', 'custom') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `farmId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FeedPurchase` ADD CONSTRAINT `FeedPurchase_feedStockId_fkey` FOREIGN KEY (`feedStockId`) REFERENCES `FeedStock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedStock` ADD CONSTRAINT `FeedStock_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedUsage` ADD CONSTRAINT `FeedUsage_feedStockId_fkey` FOREIGN KEY (`feedStockId`) REFERENCES `FeedStock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedUsage` ADD CONSTRAINT `FeedUsage_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `Lot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedUsage` ADD CONSTRAINT `FeedUsage_animalFeedingId_fkey` FOREIGN KEY (`animalFeedingId`) REFERENCES `AnimalFeeding`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnimalFeeding` ADD CONSTRAINT `AnimalFeeding_animalId_fkey` FOREIGN KEY (`animalId`) REFERENCES `Animal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnimalFeeding` ADD CONSTRAINT `AnimalFeeding_feedStockId_fkey` FOREIGN KEY (`feedStockId`) REFERENCES `FeedStock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnimalFeeding` ADD CONSTRAINT `AnimalFeeding_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `Lot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnimalFeeding` ADD CONSTRAINT `AnimalFeeding_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedingPlan` ADD CONSTRAINT `FeedingPlan_animalId_fkey` FOREIGN KEY (`animalId`) REFERENCES `Animal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedingPlan` ADD CONSTRAINT `FeedingPlan_feedStockId_fkey` FOREIGN KEY (`feedStockId`) REFERENCES `FeedStock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedingPlan` ADD CONSTRAINT `FeedingPlan_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedingPlan` ADD CONSTRAINT `FeedingPlan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
