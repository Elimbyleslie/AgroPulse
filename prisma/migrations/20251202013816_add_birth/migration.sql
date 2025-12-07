-- AlterTable
ALTER TABLE `birth` ADD COLUMN `animalReproductionId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Birth` ADD CONSTRAINT `Birth_animalReproductionId_fkey` FOREIGN KEY (`animalReproductionId`) REFERENCES `AnimalReproduction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
