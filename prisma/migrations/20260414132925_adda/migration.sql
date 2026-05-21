/*
  Warnings:

  - You are about to drop the column `abortionCount` on the `geneticperformance` table. All the data in the column will be lost.
  - You are about to drop the column `ageAtFirstBirth` on the `geneticperformance` table. All the data in the column will be lost.
  - You are about to drop the column `averageGestationDays` on the `geneticperformance` table. All the data in the column will be lost.
  - You are about to drop the column `averageOffspringPerBirth` on the `geneticperformance` table. All the data in the column will be lost.
  - You are about to drop the column `avgOffspringBirthWeight` on the `geneticperformance` table. All the data in the column will be lost.
  - You are about to drop the column `avgOffspringWeaningWeight` on the `geneticperformance` table. All the data in the column will be lost.
  - You are about to drop the column `birthIntervalDays` on the `geneticperformance` table. All the data in the column will be lost.
  - You are about to drop the column `breedingValue` on the `geneticperformance` table. All the data in the column will be lost.
  - You are about to drop the column `complicationCount` on the `geneticperformance` table. All the data in the column will be lost.
  - You are about to drop the column `consanguinityCoef` on the `geneticperformance` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `geneticperformance` table. All the data in the column will be lost.
  - You are about to drop the column `fertilityRate` on the `geneticperformance` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `geneticperformance` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfBirths` on the `geneticperformance` table. All the data in the column will be lost.
  - You are about to drop the column `totalOffspring` on the `geneticperformance` table. All the data in the column will be lost.
  - You are about to drop the column `productType` on the `production` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `GeneticPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Category` to the `Production` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Type` to the `Production` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farmId` to the `Production` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `geneticperformance` DROP COLUMN `abortionCount`,
    DROP COLUMN `ageAtFirstBirth`,
    DROP COLUMN `averageGestationDays`,
    DROP COLUMN `averageOffspringPerBirth`,
    DROP COLUMN `avgOffspringBirthWeight`,
    DROP COLUMN `avgOffspringWeaningWeight`,
    DROP COLUMN `birthIntervalDays`,
    DROP COLUMN `breedingValue`,
    DROP COLUMN `complicationCount`,
    DROP COLUMN `consanguinityCoef`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `fertilityRate`,
    DROP COLUMN `lastUpdated`,
    DROP COLUMN `numberOfBirths`,
    DROP COLUMN `totalOffspring`,
    ADD COLUMN `birthWeight` DOUBLE NULL,
    ADD COLUMN `diseaseResistance` INTEGER NULL,
    ADD COLUMN `growthRate` DOUBLE NULL,
    ADD COLUMN `inbreedingCoeff` DOUBLE NULL,
    ADD COLUMN `maternalInstinct` INTEGER NULL,
    ADD COLUMN `prolificityScore` DOUBLE NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `weaningWeight` DOUBLE NULL;

-- AlterTable
ALTER TABLE `production` DROP COLUMN `productType`,
    ADD COLUMN `Category` ENUM('Product', 'byproduct') NOT NULL,
    ADD COLUMN `Type` VARCHAR(191) NOT NULL,
    ADD COLUMN `farmId` INTEGER NOT NULL,
    ADD COLUMN `herdId` INTEGER NULL,
    ADD COLUMN `penId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Production` ADD CONSTRAINT `Production_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Production` ADD CONSTRAINT `Production_herdId_fkey` FOREIGN KEY (`herdId`) REFERENCES `Herd`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Production` ADD CONSTRAINT `Production_penId_fkey` FOREIGN KEY (`penId`) REFERENCES `Pen`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
