/*
  Warnings:

  - You are about to drop the column `latitude` on the `farm` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `farm` table. All the data in the column will be lost.
  - You are about to drop the column `contactEmail` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `contactPhone` on the `organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `farm` DROP COLUMN `latitude`,
    DROP COLUMN `longitude`;

-- AlterTable
ALTER TABLE `organization` DROP COLUMN `contactEmail`,
    DROP COLUMN `contactPhone`,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL;
