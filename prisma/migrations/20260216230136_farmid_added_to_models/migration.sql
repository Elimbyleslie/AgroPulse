-- AlterTable
ALTER TABLE `animalhealthrecord` ADD COLUMN `farmId` INTEGER NULL;

-- AlterTable
ALTER TABLE `animaltreatment` ADD COLUMN `farmId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `AnimalHealthRecord` ADD CONSTRAINT `AnimalHealthRecord_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnimalTreatment` ADD CONSTRAINT `AnimalTreatment_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
