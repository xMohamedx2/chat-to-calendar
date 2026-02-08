/**
 * ICS File Generator
 * 
 * Generates RFC 5545 compliant .ics (iCalendar) files for Apple Calendar import
 * All events are bundled into a single calendar file for easy import
 */

import { Event, ScheduleResponse } from './schema';

/**
 * Formats a date to iCalendar format (YYYYMMDDTHHMMSSZ in UTC)
 * 
 * @param localDateTime - ISO format datetime string
 * @param timezone - IANA timezone identifier
 * @returns UTC datetime in iCalendar format
 */
function formatDateForICS(localDateTime: string): string {
    const date = new Date(localDateTime);

    // Convert to UTC and format as YYYYMMDDTHHMMSSZ
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escapes special characters in iCalendar text fields
 * As per RFC 5545, backslash, semicolon, and comma must be escaped
 */
function escapeICSText(text: string): string {
    return text
        .replace(/\\/g, '\\\\')  // Backslash
        .replace(/;/g, '\\;')     // Semicolon
        .replace(/,/g, '\\,')     // Comma
        .replace(/\n/g, '\\n');   // Newline
}

/**
 * Implements RFC 5545 line folding (max 75 characters per line)
 * Long lines must be split with CRLF + space
 */
function foldLine(line: string): string {
    if (line.length <= 75) {
        return line;
    }

    const folded: string[] = [];
    let remaining = line;

    // First line can be 75 chars
    folded.push(remaining.substring(0, 75));
    remaining = remaining.substring(75);

    // Subsequent lines are indented with space, so max 74 chars of content
    while (remaining.length > 0) {
        folded.push(' ' + remaining.substring(0, 74));
        remaining = remaining.substring(74);
    }

    return folded.join('\r\n');
}

/**
 * Generates a unique identifier for an event
 */
function generateUID(event: Event, index: number): string {
    const timestamp = Date.now();
    const hash = `${event.title}-${event.start_local}-${index}`.replace(/[^a-zA-Z0-9]/g, '');
    return `${timestamp}-${hash}@chat-to-calendar`;
}

/**
 * Creates a VEVENT component for a single event
 */
function createVEvent(event: Event, index: number): string[] {
    const lines: string[] = [];

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${generateUID(event, index)}`);
    lines.push(`DTSTAMP:${formatDateForICS(new Date().toISOString())}`);
    lines.push(`DTSTART:${formatDateForICS(event.start_local)}`);
    lines.push(`DTEND:${formatDateForICS(event.end_local)}`);
    lines.push(`SUMMARY:${escapeICSText(event.title)}`);

    if (event.description) {
        lines.push(`DESCRIPTION:${escapeICSText(event.description)}`);
    }

    if (event.location) {
        lines.push(`LOCATION:${escapeICSText(event.location)}`);
    }

    lines.push('END:VEVENT');

    return lines;
}

/**
 * Generates a complete .ics file from a schedule
 * 
 * @param schedule - The complete schedule with events
 * @returns ICS file content as a string
 */
export function generateICS(schedule: ScheduleResponse): string {
    const lines: string[] = [];

    // VCALENDAR header
    lines.push('BEGIN:VCALENDAR');
    lines.push('VERSION:2.0');
    lines.push('PRODID:-//Chat to Calendar//EN');
    lines.push('CALSCALE:GREGORIAN');
    lines.push('METHOD:PUBLISH');
    lines.push(`X-WR-TIMEZONE:${schedule.timezone}`);

    // Add each event
    schedule.events.forEach((event, index) => {
        lines.push(...createVEvent(event, index));
    });

    // VCALENDAR footer
    lines.push('END:VCALENDAR');

    // Apply line folding to each line and join with CRLF
    const foldedLines = lines.map(foldLine);
    return foldedLines.join('\r\n');
}

/**
 * Creates a downloadable .ics file blob
 * 
 * @param schedule - The complete schedule
 * @returns Blob object ready for download
 */
export function createICSBlob(schedule: ScheduleResponse): Blob {
    const icsContent = generateICS(schedule);
    return new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
}

/**
 * Triggers a download of the .ics file in the browser
 * 
 * @param schedule - The complete schedule
 * @param filename - Optional filename (defaults to 'schedule.ics')
 */
export function downloadICS(schedule: ScheduleResponse, filename: string = 'schedule.ics'): void {
    const blob = createICSBlob(schedule);
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    // Clean up the object URL
    URL.revokeObjectURL(url);
}
