/*
  Warnings:

  - Made the column `treated` on table `animaltreatment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vaccinated` on table `animalvaccination` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `animaltreatment` MODIFY `treated` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `animalvaccination` MODIFY `vaccinated` BOOLEAN NOT NULL DEFAULT false;
