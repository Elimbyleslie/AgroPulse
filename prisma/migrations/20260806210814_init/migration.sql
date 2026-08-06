/*
  Warnings:

  - Added the required column `unitStorage` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `plan` ADD COLUMN `unitStorage` ENUM('MO', 'GO', 'TO') NOT NULL;
