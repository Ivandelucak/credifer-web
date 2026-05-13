-- AlterTable
ALTER TABLE `productimage` ADD COLUMN `provider` VARCHAR(50) NOT NULL DEFAULT 'local',
    ADD COLUMN `publicId` VARCHAR(500) NULL;

-- CreateIndex
CREATE INDEX `ProductImage_provider_idx` ON `ProductImage`(`provider`);
