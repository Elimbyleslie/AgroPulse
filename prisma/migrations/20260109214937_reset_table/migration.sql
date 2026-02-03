/*
  Warnings:

  - You are about to drop the column `googleId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `otp` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `otpExpiresAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `secretOtp` on the `user` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_organizationId_fkey`;

-- DropIndex
DROP INDEX `User_organizationId_fkey` ON `user`;

-- AlterTable
ALTER TABLE `organization` ADD COLUMN `ownerId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `googleId`,
    DROP COLUMN `organizationId`,
    DROP COLUMN `otp`,
    DROP COLUMN `otpExpiresAt`,
    DROP COLUMN `secretOtp`;

-- CreateTable
CREATE TABLE `_OrganizationMembers` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_OrganizationMembers_AB_unique`(`A`, `B`),
    INDEX `_OrganizationMembers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Organization` ADD CONSTRAINT `Organization_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrganizationMembers` ADD CONSTRAINT `_OrganizationMembers_A_fkey` FOREIGN KEY (`A`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrganizationMembers` ADD CONSTRAINT `_OrganizationMembers_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
