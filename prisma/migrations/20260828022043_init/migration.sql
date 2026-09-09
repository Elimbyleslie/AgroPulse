-- AlterTable
ALTER TABLE `payments` ADD COLUMN `feedStockId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_feedStockId_fkey` FOREIGN KEY (`feedStockId`) REFERENCES `feed_stock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
