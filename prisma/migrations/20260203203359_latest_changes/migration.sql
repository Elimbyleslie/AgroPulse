-- AlterTable
ALTER TABLE `animalmovement` ADD COLUMN `fromHerdId` INTEGER NULL,
    ADD COLUMN `fromLotId` INTEGER NULL,
    ADD COLUMN `toHerdId` INTEGER NULL,
    ADD COLUMN `toLotId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `AnimalMovement` ADD CONSTRAINT `AnimalMovement_fromLotId_fkey` FOREIGN KEY (`fromLotId`) REFERENCES `Lot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnimalMovement` ADD CONSTRAINT `AnimalMovement_toLotId_fkey` FOREIGN KEY (`toLotId`) REFERENCES `Lot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnimalMovement` ADD CONSTRAINT `AnimalMovement_fromHerdId_fkey` FOREIGN KEY (`fromHerdId`) REFERENCES `Herd`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnimalMovement` ADD CONSTRAINT `AnimalMovement_toHerdId_fkey` FOREIGN KEY (`toHerdId`) REFERENCES `Herd`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
