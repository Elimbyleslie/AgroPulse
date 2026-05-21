/*
  Warnings:

  - You are about to drop the column `price` on the `saleitem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[animalId]` on the table `SaleItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `farmId` to the `ExpenseCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `SaleItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `expensecategory` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `farmId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `feedingplan` ADD COLUMN `lastDistributedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `sale` ADD COLUMN `clientId` INTEGER NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `saleitem` DROP COLUMN `price`,
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `totalPrice` DOUBLE NOT NULL,
    ADD COLUMN `unitPrice` DOUBLE NOT NULL;

-- CreateTable
CREATE TABLE `Client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `SaleItem_animalId_key` ON `SaleItem`(`animalId`);

-- AddForeignKey
ALTER TABLE `ExpenseCategory` ADD CONSTRAINT `ExpenseCategory_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
