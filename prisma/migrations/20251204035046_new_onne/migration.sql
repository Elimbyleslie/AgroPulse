/*
  Warnings:

  - You are about to drop the column `date` on the `equipmentmaintenance` table. All the data in the column will be lost.
  - Added the required column `equipmentId` to the `EquipmentMaintenance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maintenanceDate` to the `EquipmentMaintenance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `equipmentmaintenance` DROP COLUMN `date`,
    ADD COLUMN `cost` DOUBLE NULL,
    ADD COLUMN `equipmentId` INTEGER NOT NULL,
    ADD COLUMN `maintenanceDate` DATETIME(3) NOT NULL;

-- AddForeignKey
ALTER TABLE `EquipmentMaintenance` ADD CONSTRAINT `EquipmentMaintenance_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `Equipment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
