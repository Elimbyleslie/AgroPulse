-- AlterTable
ALTER TABLE `animaltreatment` ADD COLUMN `inventoryId` INTEGER NULL,
    ADD COLUMN `quantityUsed` DECIMAL(12, 3) NULL;

-- AlterTable
ALTER TABLE `animalvaccination` ADD COLUMN `farmId` INTEGER NULL,
    ADD COLUMN `inventoryId` INTEGER NULL,
    ADD COLUMN `quantityUsed` DECIMAL(12, 3) NULL;

-- AddForeignKey
ALTER TABLE `AnimalTreatment` ADD CONSTRAINT `AnimalTreatment_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `inventory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnimalVaccination` ADD CONSTRAINT `AnimalVaccination_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `inventory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnimalVaccination` ADD CONSTRAINT `AnimalVaccination_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
