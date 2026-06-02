-- AlterTable
ALTER TABLE `adminuser` ADD COLUMN `isOwner` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `AdminUser_isOwner_idx` ON `AdminUser`(`isOwner`);
