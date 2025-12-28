-- CreateTable
CREATE TABLE `analytics_events` (
    `id` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(100) NOT NULL,
    `sourceService` VARCHAR(100) NOT NULL,
    `payload` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `analytics_events_eventType_idx`(`eventType`),
    INDEX `analytics_events_sourceService_idx`(`sourceService`),
    INDEX `analytics_events_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
