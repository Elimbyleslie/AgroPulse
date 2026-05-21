-- AlterTable
ALTER TABLE `feedingplan` ADD COLUMN `herdId` INTEGER NULL,
    ADD COLUMN `lotId` INTEGER NULL,
    ADD COLUMN `penId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `FeedingPlan` ADD CONSTRAINT `FeedingPlan_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `Lot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedingPlan` ADD CONSTRAINT `FeedingPlan_penId_fkey` FOREIGN KEY (`penId`) REFERENCES `Pen`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedingPlan` ADD CONSTRAINT `FeedingPlan_herdId_fkey` FOREIGN KEY (`herdId`) REFERENCES `Herd`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
