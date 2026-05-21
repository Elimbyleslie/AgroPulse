-- AlterTable
ALTER TABLE `production` ADD COLUMN `animalId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Production` ADD CONSTRAINT `Production_animalId_fkey` FOREIGN KEY (`animalId`) REFERENCES `Animal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
