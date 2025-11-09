/*
  Warnings:

  - The primary key for the `role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `role` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `rolepermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `roleId` on the `rolepermission` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `userrole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `roleId` on the `userrole` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `rolepermission` DROP FOREIGN KEY `RolePermission_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `userrole` DROP FOREIGN KEY `UserRole_roleId_fkey`;

-- DropIndex
DROP INDEX `UserRole_roleId_fkey` ON `userrole`;

-- AlterTable
ALTER TABLE `animal` ADD COLUMN `birthId` INTEGER NULL;

-- AlterTable
ALTER TABLE `barn` ADD COLUMN `photo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `farm` ADD COLUMN `photo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `herd` ADD COLUMN `photo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `lot` ADD COLUMN `photo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `role` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `rolepermission` DROP PRIMARY KEY,
    MODIFY `roleId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`roleId`, `permissionId`);

-- AlterTable
ALTER TABLE `user` ADD COLUMN `photo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `userrole` DROP PRIMARY KEY,
    MODIFY `roleId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`userId`, `roleId`);

-- CreateTable
CREATE TABLE `Birth` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `farmId` INTEGER NOT NULL,
    `lotId` INTEGER NULL,
    `motherId` INTEGER NOT NULL,
    `fatherId` INTEGER NULL,
    `date` DATETIME(3) NOT NULL,
    `numberBorn` INTEGER NOT NULL DEFAULT 1,
    `numberAlive` INTEGER NOT NULL DEFAULT 1,
    `numberDead` INTEGER NOT NULL DEFAULT 0,
    `notes` VARCHAR(191) NULL,
    `userId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Birth` ADD CONSTRAINT `Birth_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Birth` ADD CONSTRAINT `Birth_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `Lot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Birth` ADD CONSTRAINT `Birth_motherId_fkey` FOREIGN KEY (`motherId`) REFERENCES `Animal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Birth` ADD CONSTRAINT `Birth_fatherId_fkey` FOREIGN KEY (`fatherId`) REFERENCES `Animal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Birth` ADD CONSTRAINT `Birth_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Animal` ADD CONSTRAINT `Animal_birthId_fkey` FOREIGN KEY (`birthId`) REFERENCES `Birth`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
