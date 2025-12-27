import { AnalyticsEvent, EventQueryParams } from '../types/analytics.types';
export declare class AnalyticsService {
    storeEvent(eventType: string, sourceService: string, payload: Record<string, unknown>): Promise<AnalyticsEvent>;
    getEvents(params?: EventQueryParams): Promise<{
        events: AnalyticsEvent[];
        total: number;
    }>;
    getEventsByType(eventType: string, limit?: number): Promise<AnalyticsEvent[]>;
    getStatistics(): Promise<{
        totalEvents: number;
        byEventType: Record<string, number>;
        bySourceService: Record<string, number>;
    }>;
}
export declare const analyticsService: AnalyticsService;
//# sourceMappingURL=analytics.service.d.ts.map