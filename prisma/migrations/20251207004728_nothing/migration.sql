/*
  Warnings:

  - Added the required column `category` to the `Inventory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `inventory` ADD COLUMN `category` ENUM('FEED', 'MEDICINE', 'SUPPLEMENT', 'CHEMICAL', 'SEED', 'FERTILIZER', 'EQUIPMENT', 'TOOL', 'MATERIAL', 'FUEL', 'PACKAGING', 'OTHER') NOT NULL;
