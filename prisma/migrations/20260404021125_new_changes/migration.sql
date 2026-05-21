-- DropForeignKey
ALTER TABLE `feedingplan` DROP FOREIGN KEY `FeedingPlan_animalId_fkey`;

-- DropIndex
DROP INDEX `FeedingPlan_animalId_fkey` ON `feedingplan`;

-- AlterTable
ALTER TABLE `feedingplan` MODIFY `animalId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `FeedingPlan` ADD CONSTRAINT `FeedingPlan_animalId_fkey` FOREIGN KEY (`animalId`) REFERENCES `Animal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
