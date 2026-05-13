-- AlterTable
ALTER TABLE `product` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Product_deletedAt_idx` ON `Product`(`deletedAt`);
