/*
  Warnings:

  - Made the column `assignedTo` on table `farmtask` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdBy` on table `farmtask` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `farmtask` DROP FOREIGN KEY `FarmTask_assignedTo_fkey`;

-- DropForeignKey
ALTER TABLE `farmtask` DROP FOREIGN KEY `FarmTask_createdBy_fkey`;

-- DropIndex
DROP INDEX `FarmTask_assignedTo_fkey` ON `farmtask`;

-- DropIndex
DROP INDEX `FarmTask_createdBy_fkey` ON `farmtask`;

-- AlterTable
ALTER TABLE `farmtask` MODIFY `assignedTo` INTEGER NOT NULL,
    MODIFY `createdBy` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `FarmTask` ADD CONSTRAINT `FarmTask_assignedTo_fkey` FOREIGN KEY (`assignedTo`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FarmTask` ADD CONSTRAINT `FarmTask_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
