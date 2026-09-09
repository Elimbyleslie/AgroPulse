/*
  Warnings:

  - Added the required column `farmTaskId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `farmtask` ADD COLUMN `createdBy` INTEGER NULL;

-- AlterTable
ALTER TABLE `notification` ADD COLUMN `farmTaskId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_farmTaskId_fkey` FOREIGN KEY (`farmTaskId`) REFERENCES `FarmTask`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FarmTask` ADD CONSTRAINT `FarmTask_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
