/*
  Warnings:

  - The values [paypal,others] on the enum `Settings_defaultPaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - The values [paypal,others] on the enum `Settings_defaultPaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - The values [paypal,others] on the enum `Settings_defaultPaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `invoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_farmId_fkey`;

-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_subscriptionId_fkey`;

-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_farmId_fkey`;

-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_purchaseId_fkey`;

-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_saleId_fkey`;

-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `subscription` DROP FOREIGN KEY `Subscription_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `subscription` DROP FOREIGN KEY `Subscription_planId_fkey`;

-- AlterTable
ALTER TABLE `expenses` MODIFY `paymentMethod` ENUM('card', 'mobile_money', 'orange_money', 'cash', 'bank_transfer', 'check', 'other') NOT NULL DEFAULT 'cash';

-- AlterTable
ALTER TABLE `sale` MODIFY `paymentMethod` ENUM('card', 'mobile_money', 'orange_money', 'cash', 'bank_transfer', 'check', 'other') NOT NULL DEFAULT 'cash';

-- AlterTable
ALTER TABLE `settings` MODIFY `defaultPaymentMethod` ENUM('card', 'mobile_money', 'orange_money', 'cash', 'bank_transfer', 'check', 'other') NOT NULL DEFAULT 'cash';

-- DropTable
DROP TABLE `invoice`;

-- DropTable
DROP TABLE `payment`;

-- DropTable
DROP TABLE `plan`;

-- DropTable
DROP TABLE `subscription`;

-- CreateTable
CREATE TABLE `plans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `priceMonthly` DOUBLE NOT NULL,
    `priceYearly` DOUBLE NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'XOF',
    `maxFarms` INTEGER NULL,
    `maxUsers` INTEGER NULL,
    `maxAnimals` INTEGER NULL,
    `features` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `plans_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `organizationId` INTEGER NOT NULL,
    `planId` INTEGER NOT NULL,
    `status` ENUM('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED', 'PAUSED') NOT NULL DEFAULT 'TRIALING',
    `billingInterval` ENUM('MONTHLY', 'YEARLY') NOT NULL DEFAULT 'MONTHLY',
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'XOF',
    `trialStart` DATETIME(3) NULL,
    `trialEnd` DATETIME(3) NULL,
    `currentPeriodStart` DATETIME(3) NOT NULL,
    `currentPeriodEnd` DATETIME(3) NOT NULL,
    `cancelAtPeriodEnd` BOOLEAN NOT NULL DEFAULT false,
    `cancelledAt` DATETIME(3) NULL,
    `endedAt` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `subscriptions_organizationId_status_idx`(`organizationId`, `status`),
    INDEX `subscriptions_status_currentPeriodEnd_idx`(`status`, `currentPeriodEnd`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `organizationId` INTEGER NOT NULL,
    `subscriptionId` INTEGER NULL,
    `number` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE') NOT NULL DEFAULT 'DRAFT',
    `amount` DOUBLE NOT NULL,
    `taxAmount` DOUBLE NOT NULL DEFAULT 0,
    `totalAmount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'XOF',
    `periodStart` DATETIME(3) NULL,
    `periodEnd` DATETIME(3) NULL,
    `dueDate` DATETIME(3) NULL,
    `paidAt` DATETIME(3) NULL,
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_number_key`(`number`),
    INDEX `invoices_organizationId_status_idx`(`organizationId`, `status`),
    INDEX `invoices_subscriptionId_idx`(`subscriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `organizationId` INTEGER NOT NULL,
    `subscriptionId` INTEGER NULL,
    `invoiceId` INTEGER NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'XOF',
    `method` ENUM('card', 'mobile_money', 'orange_money', 'cash', 'bank_transfer', 'check', 'other') NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `provider` VARCHAR(191) NULL,
    `providerRef` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `subscription_payments_organizationId_paidAt_idx`(`organizationId`, `paidAt`),
    INDEX `subscription_payments_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `farmId` INTEGER NOT NULL,
    `saleId` INTEGER NULL,
    `purchaseId` INTEGER NULL,
    `expenseId` INTEGER NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'XOF',
    `method` ENUM('card', 'mobile_money', 'orange_money', 'cash', 'bank_transfer', 'check', 'other') NOT NULL,
    `status` ENUM('PENDING', 'PARTIAL', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `reference` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `recordedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `payments_farmId_paidAt_idx`(`farmId`, `paidAt`),
    INDEX `payments_farmId_status_idx`(`farmId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription_payments` ADD CONSTRAINT `subscription_payments_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription_payments` ADD CONSTRAINT `subscription_payments_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription_payments` ADD CONSTRAINT `subscription_payments_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_farmId_fkey` FOREIGN KEY (`farmId`) REFERENCES `Farm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `Sale`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `purchases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_expenseId_fkey` FOREIGN KEY (`expenseId`) REFERENCES `expenses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
