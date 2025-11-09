/*
  Warnings:

  - You are about to drop the column `dateAction` on the `audit` table. All the data in the column will be lost.
  - You are about to drop the column `fermeId` on the `audit` table. All the data in the column will be lost.
  - You are about to drop the column `tableCible` on the `audit` table. All the data in the column will be lost.
  - You are about to drop the column `utilisateurId` on the `audit` table. All the data in the column will be lost.
  - Added the required column `tableTarget` to the `Audit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `audit` DROP FOREIGN KEY `Audit_fermeId_fkey`;

-- DropForeignKey
ALTER TABLE `audit` DROP FOREIGN KEY `Audit_utilisateurId_fkey`;

-- DropIndex
DROP INDEX `Audit_fermeId_fkey` ON `audit`;

-- DropIndex
DROP INDEX `Audit_utilisateurId_fkey` ON `audit`;

-- AlterTable
ALTER TABLE `audit` DROP COLUMN `dateAction`,
    DROP COLUMN `fermeId`,
    DROP COLUMN `tableCible`,
    DROP COLUMN `utilisateurId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `farmId` INTEGER NULL,
    ADD COLUMN `ipAddress` VARCHAR(191) NULL,
    ADD COLUMN `newData` JSON NULL,
    ADD COLUMN `organizationId` INTEGER NULL,
    ADD COLUMN `previousData` JSON NULL,
    ADD COLUMN `recordId` INTEGER NULL,
    ADD COLUMN `tableTarget` VARCHAR(191) NOT NULL,
    ADD COLUMN `userAgent` VARCHAR(191) NULL,
    ADD COLUMN `userId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Audit_userId_idx` ON `Audit`(`userId`);

-- CreateIndex
CREATE INDEX `Audit_organizationId_idx` ON `Audit`(`organizationId`);

-- CreateIndex
CREATE INDEX `Audit_tableTarget_idx` ON `Audit`(`tableTarget`);

-- CreateIndex
CREATE INDEX `Audit_action_idx` ON `Audit`(`action`);

-- AddForeignKey
ALTER TABLE `Audit` ADD CONSTRAINT `Audit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Audit` ADD CONSTRAINT `Audit_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Audit` ADD CONSTRAINT `Audit_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
