-- AlterTable
ALTER TABLE `deliveries` MODIFY `userId` VARCHAR(191) NULL,
    MODIFY `pickupAddress` TEXT NULL,
    MODIFY `deliveryAddress` TEXT NULL,
    MODIFY `customerPhone` VARCHAR(191) NULL;
