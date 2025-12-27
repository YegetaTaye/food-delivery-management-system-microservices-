import { Prisma } from '@prisma/client';
import { getPrisma } from '../config/database';
import { AnalyticsEvent, EventQueryParams } from '../types/analytics.types';
import logger from '../utils/logger';

export class AnalyticsService {
  /**
   * Store an analytics event
   */
  async storeEvent(
    eventType: string,
    sourceService: string,
    payload: Record<string, unknown>
  ): Promise<AnalyticsEvent> {
    const prisma = getPrisma();

    const event = await prisma.analyticsEvent.create({
      data: {
        eventType,
        sourceService,
        payload: payload as Prisma.InputJsonValue,
      },
    });

    logger.info(`📊 Analytics event stored: ${eventType}`, {
      eventId: event.id,
      eventType,
      sourceService,
    });

    return {
      id: event.id,
      eventType: event.eventType,
      sourceService: event.sourceService,
      payload: event.payload as Record<string, unknown>,
      createdAt: event.createdAt,
    };
  }

  /**
   * Get all events with optional filtering
   */
  async getEvents(params: EventQueryParams = {}): Promise<{
    events: AnalyticsEvent[];
    total: number;
  }> {
    const prisma = getPrisma();
    const { eventType, sourceService, startDate, endDate, limit = 100, offset = 0 } = params;

    // Build where clause
    const where: {
      eventType?: string;
      sourceService?: string;
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (eventType) {
      where.eventType = eventType;
    }

    if (sourceService) {
      where.sourceService = sourceService;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    // Get events and count
    const [events, total] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.analyticsEvent.count({ where }),
    ]);

    return {
      events: events.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        sourceService: e.sourceService,
        payload: e.payload as Record<string, unknown>,
        createdAt: e.createdAt,
      })),
      total,
    };
  }

  /**
   * Get events by type
   */
  async getEventsByType(eventType: string, limit: number = 100): Promise<AnalyticsEvent[]> {
    const result = await this.getEvents({ eventType, limit });
    return result.events;
  }

  /**
   * Get event statistics
   */
  async getStatistics(): Promise<{
    totalEvents: number;
    byEventType: Record<string, number>;
    bySourceService: Record<string, number>;
  }> {
    const prisma = getPrisma();

    const [totalEvents, eventTypeGroups, sourceServiceGroups] = await Promise.all([
      prisma.analyticsEvent.count(),
      prisma.analyticsEvent.groupBy({
        by: ['eventType'],
        _count: { eventType: true },
      }),
      prisma.analyticsEvent.groupBy({
        by: ['sourceService'],
        _count: { sourceService: true },
      }),
    ]);

    const byEventType: Record<string, number> = {};
    eventTypeGroups.forEach((g) => {
      byEventType[g.eventType] = g._count.eventType;
    });

    const bySourceService: Record<string, number> = {};
    sourceServiceGroups.forEach((g) => {
      bySourceService[g.sourceService] = g._count.sourceService;
    });

    return {
      totalEvents,
      byEventType,
      bySourceService,
    };
  }
}

export const analyticsService = new AnalyticsService();

