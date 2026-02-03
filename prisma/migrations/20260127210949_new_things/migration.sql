/*
  Warnings:

  - You are about to alter the column `ageGroup` on the `lot` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - The values [quarantine] on the enum `Lot_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `lot` ADD COLUMN `penId` INTEGER NULL,
    MODIFY `ageGroup` ENUM('young', 'adult', 'breeding', 'fattening', 'mixed') NULL,
    MODIFY `status` ENUM('active', 'closed') NOT NULL DEFAULT 'active';

-- AddForeignKey
ALTER TABLE `Lot` ADD CONSTRAINT `Lot_penId_fkey` FOREIGN KEY (`penId`) REFERENCES `Pen`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
