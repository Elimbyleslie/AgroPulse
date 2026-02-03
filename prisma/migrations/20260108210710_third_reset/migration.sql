/*
  Warnings:

  - Added the required column `managerId` to the `Farm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `farm` ADD COLUMN `managerId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Farm` ADD CONSTRAINT `Farm_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
