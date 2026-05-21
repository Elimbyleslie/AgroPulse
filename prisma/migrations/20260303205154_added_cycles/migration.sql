/*
  Warnings:

  - A unique constraint covering the columns `[gestationId]` on the table `Birth` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `birth` ADD COLUMN `gestationId` INTEGER NULL;

-- CreateTable
CREATE TABLE `ReproductionCycle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `farmId` INTEGER NOT NULL,
    `animalId` INTEGER NOT NULL,
    `cycleType` ENUM('chaleur', 'insemination', 'confirmation', 'echec') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `status` ENUM('en_cours', 'confirme', 'echec', 'termine') NOT NULL DEFAULT 'en_cours',
    `heatIntensity` INTEGER NULL,
    `heatBehavior` VARCHAR(191) NULL,
    `inseminationType` ENUM('naturelle', 'artificielle') NULL,
    `maleId` INTEGER NULL,
    `semenBatch` VARCHAR(191) NULL,
    `technicianId` INTEGER NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gestation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `farmId` INTEGER NOT NULL,
    `animalId` INTEGER NOT NULL,
    `reproductionCycleId` INTEGER NOT NULL,
    `inseminationDate` DATETIME(3) NOT NULL,
    `expectedDeliveryDate` DATETIME(3) NOT NULL,
    `actualDeliveryDate` DATETIME(3) NULL,
    `status` ENUM('en_attente', 'confirmee', 'en_cours', 'terminee', 'avortement') NOT NULL DEFAULT 'en_attente',
    `gestationDays` INTEGER NULL,
    `confirmationDate` DATETIME(3) NULL,
    `confirmationMethod` ENUM('echographie', 'palpation', 'test_sanguin', 'observation') NULL,
    `numberOfOffspring` INTEGER NULL,
    `complications` TEXT NULL,
    `abortionDate` DATETIME(3) NULL,
    `abortionCause` VARCHAR(191) NULL,
    `lastCheckDate` DATETIME(3) NULL,
    `veterinarianId` INTEGER NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Gestation_animalId_key`(`animalId`),
    UNIQUE INDEX `Gestation_reproductionCycleId_key`(`reproductionCycleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GestationCheckup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gestationId` INTEGER NOT NULL,
    `checkDate` DATETIME(3) NOT NULL,
    `gestationDay` INTEGER NOT NULL,
    `motherWeight` DOUBLE NULL,
    `motherCondition` INTEGER NULL,
    `fetalHeartbeat` BOOLEAN NULL,
    `fetalMovement` BOOLEAN NULL,
    `complications` VARCHAR(191) NULL,
    `veterinarianId` INTEGER NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GeneticPerformance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `animalId` INTEGER NOT NULL,
    `fertilityRate` DOUBLE NULL,
    `numberOfBirths` INTEGER NOT NULL DEFAULT 0,
    `totalOffspring` INTEGER NOT NULL DEFAULT 0,
    `averageOffspringPerBirth` DOUBLE NULL,
    `averageGestationDays` INTEGER NULL,
    `birthIntervalDays` INTEGER NULL,
    `ageAtFirstBirth` INTEGER NULL,
    `consanguinityCoef` DOUBLE NULL,
    `breedingValue` DOUBLE NULL,
    `avgOffspringBirthWeight` DOUBLE NULL,
    `avgOffspringWeaningWeight` DOUBLE NULL,
    `abortionCount` INTEGER NOT NULL DEFAULT 0,
    `complicationCount` INTEGER NOT NULL DEFAULT 0,
    `lastUpdated` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GeneticPerformance_animalId_key`(`animalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pedigree` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `animalId` INTEGER NOT NULL,
    `motherId` INTEGER NULL,
    `fatherId` INTEGER NULL,
    `maternalGrandmotherId` INTEGER NULL,
    `maternalGrandfatherId` INTEGER NULL,
    `paternalGrandmotherId` INTEGER NULL,
    `paternalGrandfatherId` INTEGER NULL,
    `generation4Ids` JSON NULL,
    `completeness` INTEGER NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Pedigree_animalId_key`(`animalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Birth_gestationId_key` ON `Birth`(`gestationId`);

-- AddForeignKey
ALTER TABLE `Birth` ADD CONSTRAINT `Birth_gestationId_fkey` FOREIGN KEY (`gestationId`) REFERENCES `Gestation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReproductionCycle` ADD CONSTRAINT `ReproductionCycle_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReproductionCycle` ADD CONSTRAINT `ReproductionCycle_animalId_fkey` FOREIGN KEY (`animalId`) REFERENCES `Animal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReproductionCycle` ADD CONSTRAINT `ReproductionCycle_maleId_fkey` FOREIGN KEY (`maleId`) REFERENCES `Animal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReproductionCycle` ADD CONSTRAINT `ReproductionCycle_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gestation` ADD CONSTRAINT `Gestation_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gestation` ADD CONSTRAINT `Gestation_animalId_fkey` FOREIGN KEY (`animalId`) REFERENCES `Animal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gestation` ADD CONSTRAINT `Gestation_reproductionCycleId_fkey` FOREIGN KEY (`reproductionCycleId`) REFERENCES `ReproductionCycle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gestation` ADD CONSTRAINT `Gestation_veterinarianId_fkey` FOREIGN KEY (`veterinarianId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GestationCheckup` ADD CONSTRAINT `GestationCheckup_gestationId_fkey` FOREIGN KEY (`gestationId`) REFERENCES `Gestation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GestationCheckup` ADD CONSTRAINT `GestationCheckup_veterinarianId_fkey` FOREIGN KEY (`veterinarianId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GeneticPerformance` ADD CONSTRAINT `GeneticPerformance_animalId_fkey` FOREIGN KEY (`animalId`) REFERENCES `Animal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedigree` ADD CONSTRAINT `Pedigree_animalId_fkey` FOREIGN KEY (`animalId`) REFERENCES `Animal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedigree` ADD CONSTRAINT `Pedigree_motherId_fkey` FOREIGN KEY (`motherId`) REFERENCES `Animal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedigree` ADD CONSTRAINT `Pedigree_fatherId_fkey` FOREIGN KEY (`fatherId`) REFERENCES `Animal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedigree` ADD CONSTRAINT `Pedigree_maternalGrandmotherId_fkey` FOREIGN KEY (`maternalGrandmotherId`) REFERENCES `Animal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedigree` ADD CONSTRAINT `Pedigree_maternalGrandfatherId_fkey` FOREIGN KEY (`maternalGrandfatherId`) REFERENCES `Animal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedigree` ADD CONSTRAINT `Pedigree_paternalGrandmotherId_fkey` FOREIGN KEY (`paternalGrandmotherId`) REFERENCES `Animal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedigree` ADD CONSTRAINT `Pedigree_paternalGrandfatherId_fkey` FOREIGN KEY (`paternalGrandfatherId`) REFERENCES `Animal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
