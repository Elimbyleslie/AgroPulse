-- DropForeignKey
ALTER TABLE `invitation` DROP FOREIGN KEY `Invitation_farmId_fkey`;

-- DropIndex
DROP INDEX `Invitation_farmId_fkey` ON `invitation`;

-- AlterTable
ALTER TABLE `invitation` MODIFY `farmId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Invitation` ADD CONSTRAINT `Invitation_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
