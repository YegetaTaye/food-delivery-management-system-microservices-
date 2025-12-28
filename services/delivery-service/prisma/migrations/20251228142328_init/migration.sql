-- CreateTable
CREATE TABLE `deliveries` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `driverId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `pickupAddress` TEXT NOT NULL,
    `deliveryAddress` TEXT NOT NULL,
    `customerPhone` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NULL,
    `pickedUpAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `deliveries_orderId_key`(`orderId`),
    INDEX `deliveries_orderId_idx`(`orderId`),
    INDEX `deliveries_driverId_idx`(`driverId`),
    INDEX `deliveries_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
