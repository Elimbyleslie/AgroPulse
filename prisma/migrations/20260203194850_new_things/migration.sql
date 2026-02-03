-- AlterTable
ALTER TABLE `animalmovement` ADD COLUMN `movedById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `AnimalMovement` ADD CONSTRAINT `AnimalMovement_movedById_fkey` FOREIGN KEY (`movedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
