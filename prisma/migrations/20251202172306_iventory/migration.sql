/*
  Warnings:

  - You are about to alter the column `unit` on the `inventory` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.

*/
-- AlterTable
ALTER TABLE `inventory` MODIFY `quantity` DECIMAL(10, 2) NOT NULL,
    MODIFY `unit` ENUM('KG', 'LITER', 'TON', 'BAG', 'PIECE') NOT NULL;
