/*
  Warnings:

  - You are about to alter the column `billingCycle` on the `plan` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(7))`.

*/
-- AlterTable
ALTER TABLE `plan` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `billingCycle` ENUM('MONTHLY', 'YEARLY') NOT NULL;
