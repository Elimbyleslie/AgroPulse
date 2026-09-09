-- AlterTable
ALTER TABLE `invoices` ADD COLUMN `method` ENUM('card', 'mobile_money', 'orange_money', 'cash', 'bank_transfer', 'check', 'other') NULL;
