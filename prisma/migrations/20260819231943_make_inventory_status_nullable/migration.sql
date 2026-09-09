-- AlterTable
ALTER TABLE `inventory` MODIFY `status` ENUM('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED') NULL;
