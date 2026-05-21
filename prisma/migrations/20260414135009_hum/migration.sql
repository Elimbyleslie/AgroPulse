/*
  Warnings:

  - Added the required column `farmId` to the `GeneticPerformance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `geneticperformance` ADD COLUMN `farmId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `GeneticPerformance` ADD CONSTRAINT `GeneticPerformance_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
