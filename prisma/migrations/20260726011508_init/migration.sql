/*
  Warnings:

  - Added the required column `barnId` to the `Herd` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `herd` ADD COLUMN `barnId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Herd` ADD CONSTRAINT `Herd_barnId_fkey` FOREIGN KEY (`barnId`) REFERENCES `Barn`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
