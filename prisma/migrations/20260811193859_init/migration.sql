-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_farmTaskId_fkey`;

-- DropIndex
DROP INDEX `Notification_farmTaskId_fkey` ON `notification`;

-- AlterTable
ALTER TABLE `notification` MODIFY `farmTaskId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_farmTaskId_fkey` FOREIGN KEY (`farmTaskId`) REFERENCES `FarmTask`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
