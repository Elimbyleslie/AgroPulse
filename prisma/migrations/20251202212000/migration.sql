/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,name]` on the table `Farm` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `farm` ADD COLUMN `areaUnit` VARCHAR(191) NULL,
    ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NULL,
    MODIFY `area` DECIMAL(12, 2) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Farm_organizationId_name_key` ON `Farm`(`organizationId`, `name`);
