import { v4 as uuidv4 } from 'uuid';
import { AnalyticsEvent, EventQueryParams } from '../types/analytics.types';
import logger from '../utils/logger';

// In-memory analytics event store
const analyticsEvents: AnalyticsEvent[] = [];
const MAX_EVENTS = 10000;

export class AnalyticsStore {
  /**
   * Store an analytics event in memory
   */
  storeEvent(
    eventType: string,
    sourceService: string,
    payload: Record<string, unknown>
  ): AnalyticsEvent {
    const event: AnalyticsEvent = {
      id: uuidv4(),
      eventType,
      sourceService,
      payload,
      createdAt: new Date(),
    };

    // Add to beginning for most recent first
    analyticsEvents.unshift(event);

    // Keep store bounded
    if (analyticsEvents.length > MAX_EVENTS) {
      analyticsEvents.pop();
    }

    logger.info(`📊 Analytics event stored: ${eventType}`, {
      eventId: event.id,
      eventType,
      sourceService,
    });

    return event;
  }

  /**
   * Get all events with optional filtering
   */
  getEvents(params: EventQueryParams = {}): {
    events: AnalyticsEvent[];
    total: number;
  } {
    const { eventType, sourceService, startDate, endDate, limit = 100, offset = 0 } = params;

    let filtered = [...analyticsEvents];

    // Filter by event type
    if (eventType) {
      filtered = filtered.filter((e) => e.eventType === eventType);
    }

    // Filter by source service
    if (sourceService) {
      filtered = filtered.filter((e) => e.sourceService === sourceService);
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter((e) => e.createdAt >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((e) => e.createdAt <= endDate);
    }

    const total = filtered.length;
    const events = filtered.slice(offset, offset + limit);

    return {
      events,
      total,
    };
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: string, limit: number = 100): AnalyticsEvent[] {
    const result = this.getEvents({ eventType, limit });
    return result.events;
  }

  /**
   * Get event statistics
   */
  getStatistics(): {
    totalEvents: number;
    byEventType: Record<string, number>;
    bySourceService: Record<string, number>;
  } {
    const byEventType: Record<string, number> = {};
    const bySourceService: Record<string, number> = {};

    analyticsEvents.forEach((event) => {
      // Count by event type
      byEventType[event.eventType] = (byEventType[event.eventType] || 0) + 1;

      // Count by source service
      bySourceService[event.sourceService] = (bySourceService[event.sourceService] || 0) + 1;
    });

    return {
      totalEvents: analyticsEvents.length,
      byEventType,
      bySourceService,
    };
  }

  /**
   * Get total event count
   */
  getCount(): number {
    return analyticsEvents.length;
  }

  /**
   * Clear all events (for testing)
   */
  clear(): void {
    analyticsEvents.length = 0;
  }
}

export const analyticsStore = new AnalyticsStore();
