-- DropForeignKey
ALTER TABLE `farmtask` DROP FOREIGN KEY `FarmTask_assignedTo_fkey`;

-- DropForeignKey
ALTER TABLE `farmtask` DROP FOREIGN KEY `FarmTask_createdBy_fkey`;

-- DropIndex
DROP INDEX `FarmTask_assignedTo_fkey` ON `farmtask`;

-- DropIndex
DROP INDEX `FarmTask_createdBy_fkey` ON `farmtask`;

-- AlterTable
ALTER TABLE `farmtask` MODIFY `assignedTo` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `FarmTask` ADD CONSTRAINT `FarmTask_assignedTo_fkey` FOREIGN KEY (`assignedTo`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FarmTask` ADD CONSTRAINT `FarmTask_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
