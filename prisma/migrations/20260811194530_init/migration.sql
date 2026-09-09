/*
  Warnings:

  - Made the column `farmId` on table `invitation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `roleId` on table `invitation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `invitation` DROP FOREIGN KEY `Invitation_farmId_fkey`;

-- DropIndex
DROP INDEX `Invitation_farmId_fkey` ON `invitation`;

-- AlterTable
ALTER TABLE `invitation` MODIFY `farmId` INTEGER NOT NULL,
    MODIFY `roleId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Invitation` ADD CONSTRAINT `Invitation_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
