import { analyticsStore } from './analytics.store';
import { AnalyticsEvent, EventQueryParams } from '../types/analytics.types';

export class AnalyticsService {
  /**
   * Store an analytics event
   */
  storeEvent(
    eventType: string,
    sourceService: string,
    payload: Record<string, unknown>
  ): AnalyticsEvent {
    return analyticsStore.storeEvent(eventType, sourceService, payload);
  }

  /**
   * Get all events with optional filtering
   */
  getEvents(params: EventQueryParams = {}): {
    events: AnalyticsEvent[];
    total: number;
  } {
    return analyticsStore.getEvents(params);
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: string, limit: number = 100): AnalyticsEvent[] {
    return analyticsStore.getEventsByType(eventType, limit);
  }

  /**
   * Get event statistics
   */
  getStatistics(): {
    totalEvents: number;
    byEventType: Record<string, number>;
    bySourceService: Record<string, number>;
  } {
    return analyticsStore.getStatistics();
  }
}

export const analyticsService = new AnalyticsService();

