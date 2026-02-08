/**
 * Type definitions and JSON schema for OpenAI Structured Outputs
 * 
 * This module defines the structure of calendar events and the schema
 * used by OpenAI's API to ensure deterministic, type-safe responses.
 */

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * Represents a single calendar event
 */
export interface Event {
    title: string;
    start_local: string; // Format: "YYYY-MM-DDTHH:mm"
    end_local: string;   // Format: "YYYY-MM-DDTHH:mm"
    description?: string;
    location?: string;
}

/**
 * The complete schedule response from OpenAI
 */
export interface ScheduleResponse {
    timezone: string; // e.g., "America/New_York"
    events: Event[];
}

// ============================================================================
// JSON Schema for OpenAI Structured Outputs
// ============================================================================

/**
 * JSON schema that enforces the structure of OpenAI API responses
 * This ensures the AI returns valid, machine-readable JSON only
 */
export const scheduleResponseSchema = {
    type: "object",
    properties: {
        timezone: {
            type: "string",
            description: "IANA timezone identifier (e.g., America/New_York)"
        },
        events: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    title: {
                        type: "string",
                        description: "Event title"
                    },
                    start_local: {
                        type: "string",
                        description: "Event start time in local timezone (YYYY-MM-DDTHH:mm format)"
                    },
                    end_local: {
                        type: "string",
                        description: "Event end time in local timezone (YYYY-MM-DDTHH:mm format)"
                    },
                    description: {
                        type: "string",
                        description: "Optional event description"
                    },
                    location: {
                        type: "string",
                        description: "Optional event location"
                    }
                },
                required: ["title", "start_local", "end_local"],
                additionalProperties: false
            }
        }
    },
    required: ["timezone", "events"],
    additionalProperties: false
} as const;

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validates that an event's end time is after its start time
 */
export function isValidEventTiming(event: Event): boolean {
    const start = new Date(event.start_local);
    const end = new Date(event.end_local);
    return end > start;
}

/**
 * Checks if two events overlap in time
 */
export function eventsOverlap(event1: Event, event2: Event): boolean {
    const start1 = new Date(event1.start_local);
    const end1 = new Date(event1.end_local);
    const start2 = new Date(event2.start_local);
    const end2 = new Date(event2.end_local);

    return start1 < end2 && start2 < end1;
}

/**
 * Detects all overlapping events in a schedule
 * Returns pairs of overlapping event indices
 */
export function findOverlappingEvents(events: Event[]): [number, number][] {
    const overlaps: [number, number][] = [];

    for (let i = 0; i < events.length; i++) {
        for (let j = i + 1; j < events.length; j++) {
            if (eventsOverlap(events[i], events[j])) {
                overlaps.push([i, j]);
            }
        }
    }

    return overlaps;
}

/**
 * Validates an entire schedule response
 */
export function validateSchedule(schedule: ScheduleResponse): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Check that timezone is provided
    if (!schedule.timezone) {
        errors.push("Timezone is required");
    }

    // Check each event
    schedule.events.forEach((event, index) => {
        if (!isValidEventTiming(event)) {
            errors.push(`Event ${index + 1} (${event.title}): end time must be after start time`);
        }
    });

    // Check for overlaps
    const overlaps = findOverlappingEvents(schedule.events);
    if (overlaps.length > 0) {
        overlaps.forEach(([i, j]) => {
            errors.push(
                `Events overlap: "${schedule.events[i].title}" and "${schedule.events[j].title}"`
            );
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
