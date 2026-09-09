-- AlterTable
ALTER TABLE `animaltreatment` ADD COLUMN `frequencyDays` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `lastConfirmedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `animalvaccination` ADD COLUMN `lastConfirmedAt` DATETIME(3) NULL;
