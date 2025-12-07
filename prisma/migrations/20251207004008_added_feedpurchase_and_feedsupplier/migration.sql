/*
  Warnings:

  - You are about to drop the column `invoice_ref` on the `purchases` table. All the data in the column will be lost.
  - Added the required column `name` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Made the column `supplierId` on table `purchases` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `purchases` DROP COLUMN `invoice_ref`,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    MODIFY `supplierId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `FeedSupplier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeedPurchase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierId` INTEGER NOT NULL,
    `farmId` INTEGER NOT NULL,
    `itemName` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `unitPrice` DOUBLE NULL,
    `totalAmount` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FeedPurchase` ADD CONSTRAINT `FeedPurchase_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `FeedSupplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedPurchase` ADD CONSTRAINT `FeedPurchase_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
